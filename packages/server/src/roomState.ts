import { Packet, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import {
    getAmbient,
    Inspector,
    newAmbient,
    newState,
    run,
    StateFuncReturn,
    useLocalState,
    useSideEffect,
    useStored,
} from '@prisel/state';
import {
    playersAmbient,
    providePlayersAmbient,
    provideRoomNameAmbient,
    roomIdAmbient,
    roomNameAmbient,
    roomTypeAmbient,
} from './ambients';
import { isInRoom, isSystemAction, systemActionRequestEvent } from './events';
import { Player } from './player';
import { CreateGame, RoomType } from './serverConfig';
import { broadcast } from './utils/broadcast';
import { pipe } from './utils/pipe';
import { getPlayerInfo, getRoomStateSnapshot2 } from './utils/stateUtils';
import { useEventHandler } from './utils/useEventHandler';

function playerNoRoom({ player }: { player: Player }) {
    return !player.getRoomId();
}

const createRoomEvent = systemActionRequestEvent
    .filter(isSystemAction(priselpb.SystemActionType.CREATE_ROOM))
    .filter(playerNoRoom);

const joinEvent = (roomId: string, roomType: RoomType) =>
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

const leaveEvent = systemActionRequestEvent
    .filter(isSystemAction(priselpb.SystemActionType.LEAVE))
    .filter(isInRoom);

const gameStartEvent = systemActionRequestEvent
    .filter(isSystemAction(priselpb.SystemActionType.GAME_START))
    .filter(isInRoom);

const [roomStateToken, provideRoomStateToken] = newAmbient<{ current: number }>('room-state-token');

export function RoomState(props: { onCreateGame: CreateGame }): StateFuncReturn {
    const players = useStored<Player[]>([]);
    const roomStateToken = useStored(0);

    const { onCreateGame } = props;

    console.log('room id is ' + getAmbient(roomIdAmbient));

    useSideEffect(() => {
        const inspector = run(
            pipe(
                newState(PreoccupiedRoomState, { onCreateGame }),
                providePlayersAmbient(players),
                provideRoomStateToken(roomStateToken),
            ),
        );
        return inspector.exit;
    }, []);
}

export function PreoccupiedRoomState(props: { onCreateGame: CreateGame }): StateFuncReturn {
    const { onCreateGame } = props;
    const [roomName, setRoomName] = useLocalState('room');
    const [host, setHost] = useLocalState<Player>();
    const [occupied, setOccupied] = useLocalState(false);
    const id = getAmbient(roomIdAmbient);
    const roomType = getAmbient(roomTypeAmbient);

    useEventHandler(createRoomEvent, ({ player, packet: request }) => {
        const payload = Packet.getPayload(request, 'createRoomRequest');
        if (!payload) {
            player.respond(Response.forRequest(request).setFailure('No payload').build());
            return;
        }
        const { roomName } = payload;
        setRoomName(roomName);
        addPlayer(player);
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
                        getAmbient(playersAmbient).current,
                        updateRoomStateToken(),
                        player.getId(),
                    ),
                })
                .build(),
        );
    });

    useEventHandler(joinEvent(id, roomType), ({ player, packet: request }) => {
        const payload = Packet.getPayload(request, 'joinRequest');

        if (!payload) {
            player.respond(Response.forRequest(request).setFailure('No payload').build());
            return;
        }
        addPlayer(player);
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
                        getAmbient(playersAmbient).current,
                        token,
                        player.getId(),
                    ),
                })
                .build(),
        );
        broadcast(
            getAmbient(playersAmbient).current,
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
            newState(OccupiedRoomState, { host, onCreateGame }),
        );
    }
}

function OccupiedRoomState(props: { host: Player; onCreateGame: CreateGame }): StateFuncReturn {
    const { onCreateGame } = props;
    const [gameInpsector, setGameInspector] = useLocalState<Inspector>();
    const [host, setHost] = useLocalState(props.host);
    const id = getAmbient(roomIdAmbient);
    const roomType = getAmbient(roomTypeAmbient);

    useEventHandler(joinEvent(id, roomType), ({ player, packet: request }) => {
        const payload = Packet.getPayload(request, 'joinRequest');
        if (!payload) {
            player.respond(Response.forRequest(request).setFailure('No payload').build());
            return;
        }
        addPlayer(player);
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
                        getAmbient(playersAmbient).current,
                        token,
                        host.getId(),
                    ),
                })
                .build(),
        );
        broadcast(
            getAmbient(playersAmbient).current,
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

    useEventHandler(
        gameStartEvent,
        ({ player, packet: request }) => {
            if (!player.equals(host)) {
                player.respond(
                    Response.forRequest(request).setFailure('Only host can start game').build(),
                );
                return;
            }
            if (gameInpsector) {
                player.respond(
                    Response.forRequest(request).setFailure('Game is already started').build(),
                );
                return;
            }

            const createGameResult = onCreateGame({ players: getAmbient(playersAmbient) });
            if (typeof createGameResult === 'function') {
                player.respond(Response.forRequest(request).build());
                broadcast(
                    getAmbient(playersAmbient).current,
                    Packet.forSystemAction(priselpb.SystemActionType.ANNOUNCE_GAME_START).build(),
                );
                const gameInspector = run(createGameResult);
                setGameInspector(gameInspector);
                gameInspector.onComplete(() => {
                    setGameInspector(undefined);
                });
            } else {
                player.respond(
                    Response.forRequest(request)
                        .setFailure(createGameResult.message, createGameResult.detail)
                        .build(),
                );
            }
        },
        [host, gameInpsector],
    );

    useSideEffect(() => {
        return () => {
            gameInpsector?.exit();
        };
    }, [gameInpsector]);

    const [allPlayerLeft, setAllPlayerLeft] = useLocalState(false);

    useEventHandler(
        leaveEvent,
        ({ player, packet: request }) => {
            removePlayer(player);
            player.respond(Response.forRequest(request).build());
            const players = getAmbient(playersAmbient).current;
            if (players.length === 0) {
                // all player left.
                setAllPlayerLeft(true);
                return;
            }
            const previousToken = getRoomStateToken();
            const token = updateRoomStateToken();
            if (player.equals(host)) {
                // host left. We will replace host
                const newHost = players[0];
                setHost(newHost);
                broadcast(
                    players,
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
                players,
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
        },
        [host],
    );
    if (allPlayerLeft && getAmbient(roomTypeAmbient) === RoomType.DEFAULT) {
        // if allow reentrance
        return newState(AllPlayerLeftRoomState, { onCreateGame });
        // otherwise
        // return endState();
    }
}

export function AllPlayerLeftRoomState(props: { onCreateGame: CreateGame }): StateFuncReturn {
    const { onCreateGame } = props;
    const [host, setHost] = useLocalState<Player>();
    const [occupied, setOccupied] = useLocalState(false);
    const id = getAmbient(roomIdAmbient);
    const roomType = getAmbient(roomTypeAmbient);
    useEventHandler(joinEvent(id, roomType), ({ player, packet: request }) => {
        const payload = Packet.getPayload(request, 'joinRequest');
        if (!payload) {
            player.respond(Response.forRequest(request).setFailure('No payload').build());
            return;
        }
        addPlayer(player);
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
                        getAmbient(playersAmbient).current,
                        token,
                        player.getId(),
                    ),
                })
                .build(),
        );
        broadcast(
            getAmbient(playersAmbient).current,
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
        return newState(OccupiedRoomState, { host, onCreateGame });
    }
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

function addPlayer(player: Player) {
    const players = getAmbient(playersAmbient);
    player.setRoomId(getAmbient(roomIdAmbient));
    players.current.push(player);
}

function removePlayer(player: Player) {
    const players = getAmbient(playersAmbient);
    player.clearRoomId();
    players.current = players.current.filter((target) => !target.equals(player));
}
