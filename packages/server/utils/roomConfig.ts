import {
    MessageType,
    CreateRoomPayload,
    Request,
    JoinPayload,
    Response,
    RoomChangePayload,
    PacketType,
    JoinResponsePayload,
    CreateRoomResponsePayload,
} from '@prisel/common';
import { GAME_PHASE } from '../objects/gamePhase';
import { getFailureFor } from '../message';
import { Player } from '../player';
import { GameConfig } from './gameConfig';
import { broadcast } from './broadcast';
import { getRoomStateSnapshot, getRoomInfo, getPlayerInfo } from './stateUtils';

type PreCallback<T extends Request = Request> = (
    player: Player,
    packet: T,
) => Response<never> | void;
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
    ) => Response<never> | void;
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
            return getFailureFor(packet, `ALREADY IN A ROOM ${currentRoom.getName()}`);
        }
    },
    onCreate(player, packet) {
        const { payload } = packet;
        const { roomName } = payload;
        const room = player.createRoom({ name: roomName });
        const roomId = room.getId();
        player.joinRoom(roomId);
        room.setHost(player);
        player.respond<CreateRoomResponsePayload>(packet, {
            room: getRoomInfo(room),
            roomState: getRoomStateSnapshot(room),
        });
    },
    preJoin(player, packet) {
        const { roomId } = packet.payload;
        const currentRoom = player.getRoom();
        if (currentRoom) {
            return getFailureFor(packet, `ALREADY IN A ROOM ${currentRoom.getId()}`);
        }
        const targetRoom = player.findRoomById(roomId);
        if (!targetRoom) {
            return getFailureFor(packet, `ROOM ${roomId} DOES NOT EXIST`);
        }
        if (targetRoom.getGamePhase() === GAME_PHASE.GAME) {
            return getFailureFor(packet, 'Cannot join when game is already started');
        }
    },
    onJoin(player, packet) {
        const { roomId } = packet.payload;
        const room = player.joinRoom(roomId);
        const updateToken = room.updateStateToken();
        player.respond<JoinResponsePayload>(packet, {
            room: getRoomInfo(room),
            roomState: getRoomStateSnapshot(room),
        });
        broadcast<RoomChangePayload>(room.getPlayers(), (playerInRoom) => {
            if (playerInRoom === player) {
                return;
            }
            return {
                type: PacketType.DEFAULT,
                system_action: MessageType.ROOM_STATE_CHANGE,
                payload: {
                    playerJoin: getPlayerInfo(player),
                    token: updateToken,
                },
            };
        });
        // TODO(minor): currently, room members can grow infinitely. needs to
        // check gameConfig.maxPlayers
    },
    preLeave(player, packet) {
        if (!player.getRoom()) {
            return getFailureFor(packet, `NOT IN A ROOM`);
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
            return getFailureFor(packet, 'NOT IN A ROOM');
        }
        if (currentRoom.getGamePhase() === GAME_PHASE.GAME) {
            return getFailureFor(packet, 'GAME ALREADY STARTED');
        }
        if (player !== currentRoom.getHost()) {
            return getFailureFor(packet, 'NOT ENOUGH PRIVILEGE TO START GAME');
        }
        if (!canStart(currentRoom)) {
            return getFailureFor(packet, 'GAME_CONFIG DISALLOW STARTING GAME');
        }
    },
    onGameStart(player, packet) {
        player.respond(packet);
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

function onLeave(player: Player, leaveRequest?: Request) {
    const currentRoom = player.getRoom();
    if (currentRoom) {
        player.leaveRoom();
        if (leaveRequest) {
            player.respond(leaveRequest);
        }

        if (currentRoom.getPlayers().length === 0) {
            // all player left. Close the room
            currentRoom.close();
            return;
        }

        if (currentRoom.getHost()) {
            // host didn't leave.
            broadcast<RoomChangePayload>(currentRoom.getPlayers(), {
                type: PacketType.DEFAULT,
                system_action: MessageType.ROOM_STATE_CHANGE,
                payload: {
                    playerLeave: {
                        id: player.getId(),
                    },
                    token: currentRoom.updateStateToken(),
                },
            });
            return;
        }
        // host left, replace host
        const newHost = currentRoom.getPlayers()[0];
        currentRoom.setHost(newHost);
        const updateToken = currentRoom.updateStateToken();

        broadcast<RoomChangePayload>(currentRoom.getPlayers(), {
            type: PacketType.DEFAULT,
            system_action: MessageType.ROOM_STATE_CHANGE,
            payload: {
                hostLeave: {
                    hostId: player.getId(),
                    newHostId: newHost.getId(),
                },
                token: updateToken,
            },
        });
    }
}
