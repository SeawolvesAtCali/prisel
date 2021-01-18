import { Packet, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { GAME_PHASE } from '../objects/gamePhase';
import { Player } from '../player';
import { broadcast } from './broadcast';
import { GameConfig } from './gameConfig';
import { getPlayerInfo, getRoomInfo, getRoomStateSnapshot } from './stateUtils';

type PreCallback = (player: Player, packet: Request) => Response | void;
type Callback = (player: Player, packet: Request) => void;

type ExitCallback = (player: Player) => void;

export interface FullRoomConfig {
    type: string;
    preCreate: PreCallback;
    onCreate: Callback;
    preJoin: PreCallback;
    onJoin: Callback;
    preLeave: PreCallback;
    onLeave: Callback;
    onExit: ExitCallback;
    preGameStart: (
        player: Player,
        packet: Request,
        canStart: GameConfig['canStart'],
    ) => Response | void;
    onGameStart: Callback;
}

export type RoomConfig = Partial<FullRoomConfig>;

// pre-** is used to do precheck to fail the following action
// if pre passes, the action will proceed without checking

export const BaseRoomConfig: FullRoomConfig = {
    type: 'room',
    preCreate(player, packet) {
        const currentRoom = player.getRoom();
        if (currentRoom) {
            return Response.forRequest(packet)
                .setFailure(`ALREADY IN A ROOM ${currentRoom.getName()}`)
                .build();
        }
    },
    onCreate(player, packet) {
        const payload = Packet.getPayload(packet, 'createRoomRequest');
        if (!payload) {
            return;
        }
        const { roomName } = payload;
        const room = player.createRoom({ name: roomName });
        const roomId = room.getId();
        player.joinRoom(roomId);
        room.setHost(player);
        player.emit(
            Response.forRequest(packet)
                .setPayload('createRoomResponse', {
                    room: getRoomInfo(room),
                    roomState: getRoomStateSnapshot(room),
                })
                .build(),
        );
    },
    preJoin(player, packet) {
        const payload = Packet.getPayload(packet, 'joinRequest');
        if (!payload) {
            return Response.forRequest(packet).setFailure(`No payload`).build();
        }
        const { roomId } = payload;
        const currentRoom = player.getRoom();
        if (currentRoom) {
            return Response.forRequest(packet)
                .setFailure(`ALREADY IN A ROOM ${currentRoom.getId()}`)
                .build();
        }
        const targetRoom = player.findRoomById(roomId);
        if (!targetRoom) {
            return Response.forRequest(packet).setFailure(`ROOM ${roomId} DOES NOT EXIST`).build();
        }
        if (targetRoom.getGamePhase() === GAME_PHASE.GAME) {
            return Response.forRequest(packet)
                .setFailure('Cannot join when game is already started')
                .build();
        }
    },
    onJoin(player, packet) {
        const payload = Packet.getPayload(packet, 'joinRequest');
        if (!payload) {
            return;
        }
        const { roomId } = payload;
        const room = player.joinRoom(roomId);
        if (!room) {
            return;
        }
        const updateToken = room.updateStateToken();
        player.respond(
            Response.forRequest(packet)
                .setPayload('joinResponse', {
                    room: getRoomInfo(room),
                    roomState: getRoomStateSnapshot(room),
                })
                .build(),
        );
        broadcast(room.getPlayers(), (playerInRoom) => {
            if (playerInRoom === player) {
                return;
            }
            return Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                .setPayload('roomStateChangePayload', {
                    change: {
                        oneofKind: 'playerJoin',
                        playerJoin: getPlayerInfo(player),
                    },
                    token: updateToken,
                })
                .build();
        });
        // TODO(minor): currently, room members can grow infinitely. needs to
        // check gameConfig.maxPlayers
    },
    preLeave(player, packet) {
        if (!player.getRoom()) {
            return Response.forRequest(packet).setFailure(`NOT IN A ROOM`).build();
        }
    },
    onLeave(player, packet) {
        onLeave(player, packet);
    },
    onExit(player) {
        onLeave(player);
    },
    preGameStart(player, packet, canStart) {
        const currentRoom = player.getRoom();

        if (!currentRoom) {
            return Response.forRequest(packet).setFailure('NOT IN A ROOM').build();
        }
        if (currentRoom.getGamePhase() === GAME_PHASE.GAME) {
            return Response.forRequest(packet).setFailure('GAME ALREADY STARTED').build();
        }
        if (player !== currentRoom.getHost()) {
            return Response.forRequest(packet)
                .setFailure('NOT ENOUGH PRIVILEGE TO START GAME')
                .build();
        }
        if (canStart && !canStart(currentRoom)) {
            return Response.forRequest(packet)
                .setFailure('GAME_CONFIG DISALLOW STARTING GAME')
                .build();
        }
    },
    onGameStart(player, packet) {
        player.respond(Response.forRequest(packet).build());
        const currentRoom = player.getRoom();
        if (currentRoom) {
            broadcast(
                currentRoom.getPlayers(),
                Packet.forSystemAction(priselpb.SystemActionType.ANNOUNCE_GAME_START).build(),
            );
            currentRoom.startGame();
        }
    },
};

function onLeave(player: Player, leaveRequest?: Request) {
    const currentRoom = player.getRoom();
    if (currentRoom) {
        player.leaveRoom();
        if (leaveRequest) {
            player.respond(Response.forRequest(leaveRequest).build());
        }

        if (currentRoom.getPlayers().length === 0) {
            // all player left. Close the room
            currentRoom.close();
            return;
        }

        if (currentRoom.getHost()) {
            // host didn't leave.
            broadcast(
                currentRoom.getPlayers(),
                Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                    .setPayload('roomStateChangePayload', {
                        change: {
                            oneofKind: 'playerLeave',
                            playerLeave: player.getId(),
                        },
                        token: currentRoom.updateStateToken(),
                    })
                    .build(),
            );
            return;
        }
        // host left, replace host
        const newHost = currentRoom.getPlayers()[0];
        currentRoom.setHost(newHost);

        broadcast(
            currentRoom.getPlayers(),
            Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                .setPayload('roomStateChangePayload', {
                    change: {
                        oneofKind: 'hostLeave',
                        hostLeave: {
                            hostId: player.getId(),
                            newHostId: newHost.getId(),
                        },
                    },
                    token: currentRoom.updateStateToken(),
                })
                .build(),
        );
    }
}
