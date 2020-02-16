import {
    MessageType,
    CreateRoomPayload,
    Request,
    JoinPayload,
    Packet,
    StatusPayload,
    Response,
    RoomChangePayload,
    PacketType,
    RoomInfoPayload,
} from '@prisel/common';
import { GAME_PHASE } from '../objects/gamePhase';
import { getFailureFor, getResponseFor } from '../message';
import { Player } from '../player';
import { Status } from '@prisel/common';
import { GameConfig } from './gameConfig';
import { broadcast } from './broadcast';
import { Room } from '../room';

type PreCallback<T extends Request = Request> = (
    player: Player,
    packet: T,
) => Response<StatusPayload> | void;
type Callback<T extends Request = Request> = (player: Player, packet: T) => void;

type ExitCallback = (player: Player) => void;

interface FullRoomConfig {
    type: string;
    preCreate: PreCallback<Request<CreateRoomPayload>>;
    onCreate: Callback<Request<CreateRoomPayload>>;
    preJoin: PreCallback<Request<JoinPayload>>;
    onJoin: Callback<Request<JoinPayload>>;
    preLeave: PreCallback;
    onLeave: Callback;
    onExit: ExitCallback;
    preGameStart: (
        player: Player,
        packet: Request,
        canStart: GameConfig['canStart'],
    ) => Response<StatusPayload> | void;
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
            return getFailureFor<StatusPayload>(packet, {
                detail: `ALREADY IN A ROOM ${currentRoom.getName()}`,
            });
        }
    },
    onCreate(player, packet) {
        const { payload } = packet;
        const { roomName } = payload;
        const room = player.createRoom({ name: roomName });
        const roomId = room.getId();
        player.joinRoom(roomId);
        room.setHost(player);
        player.respond<RoomInfoPayload>(packet, Status.SUCCESS, {
            id: roomId,
            name: room.getName(),
        });
        player.emit<Packet<RoomChangePayload>>({
            type: PacketType.DEFAULT,
            system_action: MessageType.ROOM_STATE_CHANGE,
            payload: {
                newJoins: [player.getId()],
                newHost: player.getId(),
            },
        });
    },
    preJoin(player, packet) {
        const { roomId } = packet.payload;
        const currentRoom = player.getRoom();
        if (currentRoom) {
            return getFailureFor<StatusPayload>(packet, {
                detail: `ALREADY IN A ROOM ${currentRoom.getId()}`,
            });
        }
        const targetRoom = player.findRoomById(roomId);
        if (!targetRoom) {
            return getFailureFor<StatusPayload>(packet, {
                detail: `ROOM ${roomId} DOES NOT EXIST`,
            });
        }
        if (targetRoom.getGamePhase() === GAME_PHASE.GAME) {
            return getFailureFor(packet, {
                detail: 'Cannot join when game is already started',
            });
        }
    },
    onJoin(player, packet) {
        const { roomId } = packet.payload;
        const room = player.joinRoom(roomId);
        player.respond<RoomInfoPayload>(packet, Status.SUCCESS, {
            id: roomId,
            name: room.getName(),
        });
        broadcast(room.getPlayers(), (playerInRoom) => {
            if (playerInRoom === player) {
                return {
                    type: PacketType.DEFAULT,
                    system_action: MessageType.ROOM_STATE_CHANGE,
                    payload: getFullRoomUpdate(room),
                };
            }
            return {
                type: PacketType.DEFAULT,
                system_action: MessageType.ROOM_STATE_CHANGE,
                payload: {
                    newJoins: [player.getId()],
                },
            };
        });
        // TODO(minor): currently, room members can grow infinitely
    },
    preLeave(player, packet) {
        if (!player.getRoom()) {
            return getFailureFor<StatusPayload>(packet, {
                detail: `NOT IN A ROOM`,
            });
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
            return getFailureFor<StatusPayload>(packet, {
                detail: 'NOT IN A ROOM',
            });
        }
        if (currentRoom.getGamePhase() === GAME_PHASE.GAME) {
            return getFailureFor<StatusPayload>(packet, {
                detail: 'GAME ALREADY STARTED',
            });
        }
        if (player !== currentRoom.getHost()) {
            return getFailureFor<StatusPayload>(packet, {
                detail: 'NOT ENOUGH PRIVILEGE TO START GAME',
            });
        }
        if (!canStart(currentRoom)) {
            return getFailureFor<StatusPayload>(packet, {
                detail: 'GAME_CONFIG DISALLOW STARTING GAME',
            });
        }
    },
    onGameStart(player, packet) {
        player.respond(packet, Status.SUCCESS);
        const currentRoom = player.getRoom();
        if (currentRoom) {
            broadcast(currentRoom.getPlayers(), {
                type: PacketType.DEFAULT,
                system_action: MessageType.ANNOUNCE_GAME_START,
            });
            currentRoom.startGame();
        }
    },
};

function getFullRoomUpdate(room: Room): RoomChangePayload {
    const host = room.getHost();
    const players = room.getPlayers();
    const roomUpdate: RoomChangePayload = {
        newJoins: players.map((player) => player.getId()),
    };
    if (host) {
        roomUpdate.newHost = host.getId();
    }
    return roomUpdate;
}

function onLeave(player: Player, leaveRequest?: Request) {
    const currentRoom = player.getRoom();
    if (currentRoom) {
        const roomUpdate: RoomChangePayload = {};
        // TODO(minor): other way of checking player instead of using identity
        if (currentRoom.getHost() === player) {
            const nextHost = currentRoom
                .getPlayers()
                .find((playerInRoom) => playerInRoom !== player);
            if (nextHost) {
                currentRoom.setHost(nextHost);
                roomUpdate.newHost = nextHost.getId();
            }
        }
        player.leaveRoom();
        if (leaveRequest) {
            player.respond(leaveRequest, Status.SUCCESS);
        }
        roomUpdate.newLeaves = [player.getId()];
        const remainedPlayers = currentRoom.getPlayers();
        if (remainedPlayers.length === 0) {
            // no player left, remove the room
            currentRoom.close();
        } else {
            broadcast(remainedPlayers, {
                type: PacketType.DEFAULT,
                system_action: MessageType.ROOM_STATE_CHANGE,
                payload: roomUpdate,
            });
        }
    }
}
