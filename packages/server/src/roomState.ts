import { Packet, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import {
    endState,
    getAmbient,
    newAmbient,
    newState,
    run,
    SetLocalState,
    StateFuncReturn,
    useLocalState,
    useSideEffect,
    useStored,
} from '@prisel/state';
import {
    provideRoomNameAmbient,
    roomIdAmbient,
    roomNameAmbient,
    roomTypeAmbient,
} from './ambients';
import { isInRoom, isSystemAction, playerExitRoomEvent, systemActionRequestEvent } from './events';
import { Player } from './player';
import { emitPlayerJoinEvent, emitPlayerLeaveEvent } from './roomEvent';
import { CreateGame, CreateTurnOrder, RoomType } from './serverConfig';
import { RoundRobin, TurnOrder } from './turnOrder';
import { broadcast } from './utils/broadcast';
import { pipe } from './utils/pipe';
import { getPlayerInfo, getRoomStateSnapshot2 } from './utils/stateUtils';
import { useEventHandler } from './utils/useEventHandler';

function playerNoRoom({ player }: { player: Player }) {
    return !player.getRoomId();
}

const joinRequestEvent = (roomId: string, roomType: RoomType) =>
    systemActionRequestEvent
        .filter(isSystemAction(priselpb.SystemActionType.JOIN))
        .filter(playerNoRoom)
        .filter(({ packet }) => {
            const payload = Packet.getPayload(packet, 'joinRequest');
            if (
                payload &&
                payload.room.oneofKind === 'defaultRoom' &&
                roomType === RoomType.DEFAULT
            ) {
                return true;
            }
            if (payload && payload.room.oneofKind === 'roomId' && payload.room.roomId === roomId) {
                return true;
            }
            return false;
        });

const leaveRequestEvent = systemActionRequestEvent
    .filter(isSystemAction(priselpb.SystemActionType.LEAVE))
    .filter(isInRoom);

const gameStartRequestEvent = systemActionRequestEvent
    .filter(isSystemAction(priselpb.SystemActionType.GAME_START))
    .filter(isInRoom);

const [roomStateToken, provideRoomStateToken] = newAmbient<{ current: number }>('room-state-token');

export function RoomState(props: {
    onCreateGame: CreateGame;
    createRoomEvent?: { player: Player; request: Request };
    onCreateTurnOrder?: CreateTurnOrder;
}): StateFuncReturn {
    const roomStateToken = useStored(0);

    const {
        onCreateGame,
        createRoomEvent: createEvent,
        onCreateTurnOrder = (players) => new RoundRobin(players),
    } = props;

    useSideEffect(() => {
        const turnOrder = onCreateTurnOrder([]);
        run(
            pipe(
                newState(PreoccupiedRoomState, { onCreateGame, createEvent, turnOrder }),
                provideRoomStateToken(roomStateToken),
            ),
        );
    }, []);
}

export function PreoccupiedRoomState(props: {
    onCreateGame: CreateGame;
    createEvent?: { player: Player; request: Request };
    turnOrder: TurnOrder;
}): StateFuncReturn {
    const { onCreateGame, createEvent, turnOrder } = props;
    const [roomName, setRoomName] = useLocalState('room');
    const [host, setHost] = useLocalState<Player>();
    const [occupied, setOccupied] = useLocalState(false);
    const id = getAmbient(roomIdAmbient);
    const roomType = getAmbient(roomTypeAmbient);

    useSideEffect(() => {
        if (!createEvent) {
            // perform room customization base on host's request. Not need to do
            // that if the room is default room
            return;
        }

        const { player, request } = createEvent;
        const payload = Packet.getPayload(request, 'createRoomRequest');
        if (!payload) {
            player.respond(Response.forRequest(request).setFailure('No payload').build());
            return;
        }
        const { roomName } = payload;
        setRoomName(roomName);
        addPlayer(turnOrder, player);
        setOccupied(true);
        setHost(player);

        player.respond(
            Response.forRequest(request)
                .setPayload('createRoomResponse', {
                    room: {
                        name: roomName,
                        id: getAmbient(roomIdAmbient),
                    },
                    roomState: getRoomStateSnapshot2(
                        turnOrder.getAllPlayers(),
                        updateRoomStateToken(),
                        player.getId(),
                    ),
                })
                .build(),
        );
    }, [createEvent]);

    useEventHandler(joinRequestEvent(id, roomType), ({ player, packet: request }) => {
        const payload = Packet.getPayload(request, 'joinRequest');

        if (!payload) {
            player.respond(Response.forRequest(request).setFailure('No payload').build());
            return;
        }
        addPlayer(turnOrder, player);
        setOccupied(true);
        setHost(player);
        const previousToken = getRoomStateToken();
        const token = updateRoomStateToken();
        player.respond(
            Response.forRequest(request)
                .setPayload('joinResponse', {
                    room: {
                        name: roomName,
                        id,
                    },
                    roomState: getRoomStateSnapshot2(
                        turnOrder.getAllPlayers(),
                        token,
                        player.getId(),
                    ),
                })
                .build(),
        );
        broadcast(
            turnOrder.getAllPlayers(),
            Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                .setPayload('roomStateChangePayload', {
                    change: {
                        oneofKind: 'playerJoin',
                        playerJoin: getPlayerInfo(player),
                    },
                    token: {
                        previousToken,
                        token,
                    },
                })
                .build(),
        );
    });

    if (occupied && host) {
        return provideRoomNameAmbient(
            roomName,
            newState(OccupiedRoomState, { host, onCreateGame, turnOrder }),
        );
    }
}

function OccupiedRoomState(props: {
    host: Player;
    onCreateGame: CreateGame;
    turnOrder: TurnOrder;
}): StateFuncReturn {
    const { onCreateGame, turnOrder } = props;
    const [host, setHost] = useLocalState(props.host);
    const [gameStarted, setGameStarted] = useLocalState(false);
    const [allPlayerLeft, setAllPlayerLeft] = useLocalState(false);

    const id = getAmbient(roomIdAmbient);
    const roomType = getAmbient(roomTypeAmbient);

    useEventHandler(joinRequestEvent(id, roomType), ({ player, packet: request }) => {
        const payload = Packet.getPayload(request, 'joinRequest');
        if (!payload) {
            player.respond(Response.forRequest(request).setFailure('No payload').build());
            return;
        }
        addPlayer(turnOrder, player);
        const previousToken = getRoomStateToken();
        const token = updateRoomStateToken();
        player.respond(
            Response.forRequest(request)
                .setPayload('joinResponse', {
                    room: {
                        name: getAmbient(roomNameAmbient),
                        id: getAmbient(roomIdAmbient),
                    },
                    roomState: getRoomStateSnapshot2(
                        turnOrder.getAllPlayers(),
                        token,
                        host.getId(),
                    ),
                })
                .build(),
        );
        broadcast(
            turnOrder.getAllPlayers(),
            Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                .setPayload('roomStateChangePayload', {
                    change: {
                        oneofKind: 'playerJoin',
                        playerJoin: getPlayerInfo(player),
                    },
                    token: {
                        previousToken,
                        token,
                    },
                })
                .build(),
        );
        emitPlayerJoinEvent.send(player);
    });

    useEventHandler(gameStartRequestEvent, ({ player, packet: request }) => {
        if (!player.equals(host)) {
            player.respond(
                Response.forRequest(request).setFailure('Only host can start game').build(),
            );
            return;
        }
        if (gameStarted) {
            player.respond(
                Response.forRequest(request).setFailure('Game is already started').build(),
            );
            return;
        }

        const createGameResult = onCreateGame({ turnOrder });
        if (typeof createGameResult === 'function') {
            player.respond(Response.forRequest(request).build());
            broadcast(
                turnOrder.getAllPlayers(),
                Packet.forSystemAction(priselpb.SystemActionType.ANNOUNCE_GAME_START).build(),
            );
            run(createGameResult).onComplete(() => {
                setGameStarted(false);
            });
            setGameStarted(true);
        } else {
            player.respond(
                Response.forRequest(request)
                    .setFailure(createGameResult.message, createGameResult.detail)
                    .build(),
            );
        }
    });

    useEventHandler(leaveRequestEvent, ({ player, packet: request }) => {
        removePlayer(turnOrder, player);
        player.respond(Response.forRequest(request).build());
        updateRoomStateAfterPlayerLeave(
            player,
            player.equals(host),
            turnOrder,
            setHost,
            setAllPlayerLeft,
        );
    });
    // if player disconnect without leaving the room first
    useEventHandler(playerExitRoomEvent, (player) => {
        removePlayer(turnOrder, player);
        updateRoomStateAfterPlayerLeave(
            player,
            player.equals(host),
            turnOrder,
            setHost,
            setAllPlayerLeft,
        );
    });
    if (allPlayerLeft) {
        switch (getAmbient(roomTypeAmbient)) {
            case RoomType.DEFAULT:
                // single room mode, we will allow reentrance
                return newState(AllPlayerLeftRoomState, { onCreateGame, turnOrder });
            case RoomType.MULTI:
                // multi room mode, we will end the room
                return endState();
        }
    }
}

export function AllPlayerLeftRoomState(props: {
    onCreateGame: CreateGame;
    turnOrder: TurnOrder;
}): StateFuncReturn {
    const { onCreateGame, turnOrder } = props;
    const [host, setHost] = useLocalState<Player>();
    const [occupied, setOccupied] = useLocalState(false);
    const id = getAmbient(roomIdAmbient);
    const roomType = getAmbient(roomTypeAmbient);
    useEventHandler(joinRequestEvent(id, roomType), ({ player, packet: request }) => {
        const payload = Packet.getPayload(request, 'joinRequest');
        if (!payload) {
            player.respond(Response.forRequest(request).setFailure('No payload').build());
            return;
        }
        addPlayer(turnOrder, player);
        setOccupied(true);
        setHost(player);
        const previousToken = getRoomStateToken();
        const token = updateRoomStateToken();
        player.respond(
            Response.forRequest(request)
                .setPayload('joinResponse', {
                    room: {
                        name: getAmbient(roomNameAmbient),
                        id: getAmbient(roomIdAmbient),
                    },
                    roomState: getRoomStateSnapshot2(
                        turnOrder.getAllPlayers(),
                        token,
                        player.getId(),
                    ),
                })
                .build(),
        );
        broadcast(
            turnOrder.getAllPlayers(),
            Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                .setPayload('roomStateChangePayload', {
                    change: {
                        oneofKind: 'playerJoin',
                        playerJoin: getPlayerInfo(player),
                    },
                    token: {
                        previousToken,
                        token,
                    },
                })
                .build(),
        );
    });

    if (occupied && host) {
        return newState(OccupiedRoomState, { host, onCreateGame, turnOrder });
    }
}

function updateRoomStateAfterPlayerLeave(
    player: Player,
    isHostLeft: boolean,
    turnOrder: TurnOrder,
    setHost: SetLocalState<Player>,
    setAllPlayerLeft: SetLocalState<boolean>,
) {
    if (turnOrder.size === 0) {
        // all player left.
        setAllPlayerLeft(true);
        return;
    }
    const previousToken = getRoomStateToken();
    const token = updateRoomStateToken();
    if (isHostLeft) {
        // host left. We will choose the current player as host
        const newHost = turnOrder.getCurrentPlayer()!!;
        setHost(newHost);
        broadcast(
            turnOrder.getAllPlayers(),
            Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                .setPayload('roomStateChangePayload', {
                    change: {
                        oneofKind: 'hostLeave',
                        hostLeave: {
                            hostId: player.getId(),
                            newHostId: newHost.getId(),
                        },
                    },
                    token: {
                        previousToken,
                        token,
                    },
                })
                .build(),
        );
        return;
    }
    // player left
    broadcast(
        turnOrder.getAllPlayers(),
        Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
            .setPayload('roomStateChangePayload', {
                change: {
                    oneofKind: 'playerLeave',
                    playerLeave: player.getId(),
                },
                token: { previousToken, token },
            })
            .build(),
    );
    // let child state (game state) know that a player left
    emitPlayerLeaveEvent.send(player);
}

function getRoomStateToken(): string {
    const token = getAmbient(roomStateToken);
    return `${token.current}`;
}

function updateRoomStateToken(): string {
    const token = getAmbient(roomStateToken);
    token.current++;
    return `${token.current}`;
}

function addPlayer(turnOrder: TurnOrder, player: Player) {
    player.setRoomId(getAmbient(roomIdAmbient));
    turnOrder.addPlayer(player);
}

function removePlayer(turnOrder: TurnOrder, player: Player) {
    player.clearRoomId();
    if (player.equals(turnOrder.getCurrentPlayer())) {
        turnOrder.giveTurnToNext();
    }
    turnOrder.removePlayer(player);
}
