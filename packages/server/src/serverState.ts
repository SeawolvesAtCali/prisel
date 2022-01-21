import { newRequestManager, newRoomId, Packet, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import {
    endState,
    Inspector,
    newState,
    run,
    useComputed,
    useLocalState,
    useSideEffect,
} from '@prisel/state';
import { Server as WebSocketServer, WebSocket } from 'ws';
import { provideGetPlayerAmbient, provideRoomIdAmbient, provideRoomTypeAmbient } from './ambients';
import debug from './debug';
import { emitPacketEvent } from './events';
import { Player } from './player';
import { RoomState } from './roomState';
import { CreateGame, RoomType, ServerConfig } from './serverConfig';
import SocketManager from './socketManager';
import { SocketState } from './socketState';
import {
    closeSocket,
    createServerFromHTTPServer,
    createServerWithInternalHTTPServer,
} from './utils/networkUtils';
import { pipe } from './utils/pipe';

function ServerState(
    props: ServerConfig = {
        host: 'localhost',
        port: 3000,
        roomType: RoomType.DEFAULT,
        onCreateGame: () => () => endState(),
    },
) {
    const { roomType = RoomType.DEFAULT } = props;
    const [server, setServer] = useLocalState<WebSocketServer>();
    useSideEffect(() => {
        if (props.server) {
            setServer(createServerFromHTTPServer(props.server));
            return () => {
                if (props.onClose) {
                    props.onClose();
                }
            };
        }
        if (props.host && props.port) {
            const [wsServer, httpServer] = createServerWithInternalHTTPServer({
                host: props.host,
                port: props.port,
            });
            setServer(wsServer);
            // internally created http server will be closed once WebSocket
            // server is closed. External http server needs to be closed manually.
            return () => {
                httpServer.close();
                if (props.onClose) {
                    props.onClose();
                }
            };
        }
    }, []);

    const requests = useComputed(() => newRequestManager(), []);
    const socketManager = useComputed(() => new SocketManager(), []);
    const players = useComputed(() => new Map<string, Player>(), []);
    const socketInspectors = useComputed(() => new Set<Inspector>(), []);
    const roomInspectors = useComputed(() => new Set<Inspector>(), []);
    const getPlayer = useComputed(
        () => (socket: WebSocket) => players.get(socketManager.getId(socket) || ''),
        [],
    );

    const defaultRoom = useDefaultRoom(roomType, props.onCreateGame, getPlayer);
    useSideEffect(() => {
        if (server) {
            const connectionListener = (socket: WebSocket) => {
                const inspector = run(SocketState, {
                    requests,
                    socket,
                    socketManager,
                    players,
                    onCreateRoom: (player, request) => {
                        // if server is single room mode, we don't allow
                        // creating room
                        if (defaultRoom) {
                            player.respond(
                                Response.forRequest(request)
                                    .setFailure('Cannot create room in single room server')
                                    .build(),
                            );
                            return;
                        }
                        if (props.onCreateGame) {
                            roomInspectors.add(runRoom(roomType, props.onCreateGame, getPlayer));
                            // We don't add player to room here because it will
                            // be handled by RoomState.
                        }
                    },
                    onEnd: () => {
                        // socket disconnects by itself (disconnect or timeout)
                        // before server ends
                        socketInspectors.delete(inspector);
                        debug('client disconnected');
                        emitPacketEvent.send({
                            socket,
                            packet: Packet.forSystemAction(priselpb.SystemActionType.EXIT).build(),
                        });
                        closeSocket(socket);
                        const userId = socketManager.getId(socket);
                        if (userId) {
                            socketManager.removeById(userId);
                            players.delete(userId);
                        }
                    },
                });
                socketInspectors.add(inspector);
            };
            server.on('connection', connectionListener);
            return () => {
                server.off('connection', connectionListener);
                // clean up inspectors because server is cancelled.
                for (const inspector of socketInspectors) {
                    inspector.exit();
                }
                for (const inspector of roomInspectors) {
                    inspector.exit();
                }
                requests.clear();
            };
        }
    }, [server]);
}

function runRoom(
    roomType: RoomType,
    onCreateGame: CreateGame,
    getPlayer: (player: WebSocket) => Player | undefined,
) {
    return run(
        pipe(
            newState(RoomState, {
                onCreateGame,
            }),
            provideGetPlayerAmbient(getPlayer),
            provideRoomIdAmbient(newRoomId()),
            provideRoomTypeAmbient(roomType),
        ),
    );
}

function useDefaultRoom(
    roomType: RoomType,
    onCreateGame: CreateGame,
    getPlayer: (player: WebSocket) => Player | undefined,
) {
    const defaultRoom = useComputed(
        () => (roomType === RoomType.DEFAULT ? runRoom(roomType, onCreateGame, getPlayer) : null),
        [roomType, onCreateGame],
    );
    useSideEffect(() => {
        if (defaultRoom) {
            return () => {
                defaultRoom.exit();
            };
        }
    }, [defaultRoom]);
    return defaultRoom;
}

/**
 * Server is a wrapper on top of the websocket server.
 * It provides utilities to control the server lifecycle.
 *
 * To create a server, simply call the constructor.
 *
 * ```js
 * import { Server } from '@prisel/server';
 * const server = new Server(); // By default a new server is started at localhost:3000
 * ```
 *
 * We can also specify the hostname and port number.
 *
 * ```js
 * const server = new Server({host: '0.0.0.0', port: 3000});
 * ```
 *
 * By default, prisel uses [koa](https://koajs.com/) for the underlying HTTP server, to use an existing server instead, we can specify the server property.
 *
 * ```js
 * // use an express server.
 * import express from 'express';
 * import http from 'http';
 *
 * const app = express();
 * const expressServer = http.createServer(express);
 * const server = Server.create({server: expressServer});
 * ```
 */
export const Server = {
    create(config?: ServerConfig) {
        return run(ServerState, config).exit;
    },
};
