import {
    HEARTBEAT_INTERVAL,
    newClientId,
    Packet,
    Request,
    RequestManager,
    Response,
} from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { endState, useComputed, useLocalState, useSideEffect, useStored } from '@prisel/state';
import { RawData, WebSocket } from 'ws';
import debug from './debug';
import { emitPacketEvent, emitPlayerExitEvent } from './events';
import { DEBUG_MODE } from './flags';
import { getError, getWelcome } from './message';
import { newPlayer, Player } from './player';
import SocketManager from './socketManager';
import { closeSocket, emit } from './utils/networkUtils';
import { safeStringify } from './utils/safeStringify';

export function SocketState(props: {
    requests: RequestManager;
    socket: WebSocket;
    socketManager: SocketManager;
    players: Map<string, Player>;
    onCreateRoom: (player: Player, request: Request) => void;
    onEnd?: () => void;
}) {
    const { requests, socket, socketManager, players } = props;
    const [dead, setDead] = useLocalState(false);
    const timeoutRef = useStored(false);
    const id = useComputed(() => newClientId(), []);
    const [player, setPlayer] = useLocalState<Player>();
    useSideEffect(() => {
        debug('client connected');
        emit(socket, getWelcome());
        const pongListener = () => {
            timeoutRef.current = false;
        };
        const disconnectListener = () => {
            setDead(true);
        };
        socket.on('disconnect', disconnectListener);
        socket.on('pong', pongListener);
        const interval = setInterval(() => {
            if (timeoutRef.current) {
                setDead(true);
            }
            socket.ping();
            timeoutRef.current = true;
        }, HEARTBEAT_INTERVAL);

        return () => {
            socket.off('disconnect', disconnectListener);
            socket.off('pong', pongListener);
            clearInterval(interval);
            emitPacketEvent.send({
                socket,
                packet: Packet.forSystemAction(priselpb.SystemActionType.EXIT).build(),
            });
        };
    }, []);

    useSideEffect(() => {
        const messageHandler = (data: RawData) => {
            if (!data) {
                return;
            }
            const packet = Packet.deserialize(data);
            if (!Packet.is(packet)) {
                debug(`packet structure is invalid ${safeStringify(packet)}`);
                if (DEBUG_MODE) {
                    if (player) {
                        player.emit(getError('packet structure is invalid', safeStringify(packet)));
                    } else {
                        debug(`player is not logged in, cannot send error report`);
                    }
                    // TODO send info back to client
                    return;
                }
                return;
            }

            // handle response
            if (Response.isResponse(packet)) {
                const { requestId: id } = packet;
                if (requests.isWaitingFor(id)) {
                    requests.onResponse(packet);
                } else {
                    debug(`response with id ${id} is unclaimed ${JSON.stringify(packet)}`);
                }
                return;
            }

            // handle LOGIN
            if (
                !player &&
                Request.isRequest(packet) &&
                Packet.isSystemAction(packet, priselpb.SystemActionType.LOGIN)
            ) {
                if (socketManager.hasId(id)) {
                    // already logged in, no need to do anything
                    return;
                }

                const payload = Packet.getPayload(packet, 'loginRequest');
                if (payload) {
                    const { username } = payload;
                    socketManager.add(id, socket);
                    const player = newPlayer({
                        name: username,
                        id,
                        getSocket: () => (socketManager.hasSocket(socket) ? socket : undefined),
                        requests,
                    });
                    players.set(id, player);
                    player.respond(
                        Response.forRequest(packet)
                            .setPayload('loginResponse', { userId: id })
                            .build(),
                    );
                    setPlayer(player);
                }
                return;
            }

            // handle CREATE_ROOM
            if (
                player &&
                Request.isRequest(packet) &&
                Packet.isSystemAction(packet, priselpb.SystemActionType.CREATE_ROOM)
            ) {
                props.onCreateRoom(player, packet);
                return;
            }

            // handle other messages
            if (player) {
                debug('sending action %s', JSON.stringify(packet.message, null, 2));
                // handle packet or request
                emitPacketEvent.send({ socket, packet });
            }
        };
        socket.on('message', messageHandler);
        return () => {
            socket.off('message', messageHandler);
        };
    }, [player]);

    useSideEffect(() => {
        return () => {
            closeSocket(socket);
            players.delete(id);
            socketManager.removeById(id);
        };
    }, []);

    useSideEffect(() => {
        if (player) {
            return () => {
                emitPlayerExitEvent.send(player);
            };
        }
    }, [player]);

    if (dead) {
        return endState({ onEnd: props.onEnd || (() => {}) });
    }
}
