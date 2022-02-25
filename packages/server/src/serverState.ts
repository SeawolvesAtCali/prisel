import { newRequestManager, newRoomId, Request, Response } from '@prisel/common';
import {
    endState,
    newEvent,
    newState,
    run,
    useComputed,
    useLocalState,
    useSideEffect,
} from '@prisel/state';
import { Server as WebSocketServer, WebSocket } from 'ws';
import { provideGetPlayerAmbient, provideRoomIdAmbient, provideRoomTypeAmbient } from './ambients';
import { Player } from './player';
import { RoomState } from './roomState';
import { CreateGame, RoomType, ServerConfig } from './serverConfig';
import SocketManager from './socketManager';
import { SocketState } from './socketState';
import {
    createServerFromHTTPServer,
    createServerWithInternalHTTPServer,
} from './utils/networkUtils';
import { pipe } from './utils/pipe';
import { useEventHandler } from './utils/useEventHandler';

const [createRoomEvent, emitCreateRoomEvent] = newEvent<{ player: Player; request: Request }>(
    'socket-requested-createRoom',
);

const [createSocketEvent, emitCreateSocketEvent] = newEvent<WebSocket>('create-socket');

function ServerState(
    props: ServerConfig = {
        host: 'localhost',
        port: 3000,
        roomType: RoomType.DEFAULT,
        onCreateGame: () => () => endState(),
    },
) {
    const { roomType = RoomType.DEFAULT } = props;
    const server = useServer(props);
    const requests = useComputed(() => newRequestManager(), []);
    const socketManager = useComputed(() => new SocketManager(), []);
    const players = useComputed(() => new Map<string, Player>(), []);
    const getPlayer = useComputed(
        () => (socket: WebSocket) => players.get(socketManager.getId(socket) || ''),
        [],
    );
    const isDefaultRoom = useDefaultRoom(roomType, props.onCreateGame, getPlayer);
    useEventHandler(createRoomEvent, (createEvent) => {
        runRoom(roomType, props.onCreateGame, getPlayer, createEvent);
    });

    useSideEffect(() => {
        if (server) {
            const connectionListener = (socket: WebSocket) => {
                emitCreateSocketEvent.send(socket);
            };
            server.on('connection', connectionListener);
            return () => {
                server.off('connection', connectionListener);
                requests.clear();
            };
        }
    }, [server]);

    useEventHandler(createSocketEvent, (socket) => {
        run(SocketState, {
            requests,
            socket,
            socketManager,
            players,
            onCreateRoom: (player, request) => {
                // if server is single room mode, we don't allow
                // creating room
                if (isDefaultRoom) {
                    player.respond(
                        Response.forRequest(request)
                            .setFailure('Cannot create room in single room server')
                            .build(),
                    );
                    return;
                }
                emitCreateRoomEvent.send({ player, request });
            },
        });
    });
}

function useServer(props: ServerConfig) {
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
    return server;
}

function runRoom(
    roomType: RoomType,
    onCreateGame: CreateGame,
    getPlayer: (player: WebSocket) => Player | undefined,
    createEvent?: { player: Player; request: Request },
) {
    return run(
        pipe(
            newState(RoomState, {
                onCreateGame,
                createEvent,
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
    const isDefaultRoom = roomType === RoomType.DEFAULT;
    useSideEffect(() => {
        if (isDefaultRoom) {
            const inspector = runRoom(roomType, onCreateGame, getPlayer);
            return () => {
                inspector.exit();
            };
        }
    }, []);
    return isDefaultRoom;
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
