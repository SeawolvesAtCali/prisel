import { isNull, Packet, PacketView, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { debug } from '../debug';
import { GAME_PHASE } from '../objects/gamePhase';
import { Player } from '../player';
import { broadcast } from './broadcast';
import { GameConfig } from './gameConfig';
import { buildRoomStateSnapshot } from './stateUtils';

type PreCallback = (player: Player, packet: Request) => PacketView<Response> | void;
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
    ) => PacketView<Response> | void;
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
                .withFailure(`ALREADY IN A ROOM ${currentRoom.getName()}`)
                .build();
        }
    },
    onCreate(player, packet) {
        const payload = Packet.getPayload(
            packet,
            priselpb.CreateRoomRequest.getRootAsCreateRoomRequest,
        );
        if (isNull(payload)) {
            return;
        }
        const roomName = payload.roomName();
        const room = player.createRoom({ name: roomName ?? 'unnamed room' });
        const roomId = room.getId();
        player.joinRoom(roomId);
        room.setHost(player);
        player.emit(
            Response.forRequest(packet)
                .withPayloadBuilder((builder) => {
                    const roomInfoOffset = room.buildRoomInfo(builder);
                    const roomStateOffset = buildRoomStateSnapshot(builder, room);

                    priselpb.CreateRoomResponse.startCreateRoomResponse(builder);

                    priselpb.CreateRoomResponse.addRoom(builder, roomInfoOffset);
                    priselpb.CreateRoomResponse.addRoomState(builder, roomStateOffset);
                    return priselpb.CreateRoomResponse.endCreateRoomResponse(builder);
                })
                .build(),
        );
    },
    preJoin(player, packet) {
        const payload = Packet.getPayload(packet, priselpb.JoinRequest.getRootAsJoinRequest);
        if (isNull(payload)) {
            return Response.forRequest(packet).withFailure(`No payload`).build();
        }
        const roomId = payload.roomId();
        const currentRoom = player.getRoom();
        if (currentRoom) {
            return Response.forRequest(packet)
                .withFailure(`ALREADY IN A ROOM ${currentRoom.getId()}`)
                .build();
        }
        const targetRoom = player.findRoomById(roomId);
        if (isNull(targetRoom)) {
            return Response.forRequest(packet).withFailure(`ROOM ${roomId} DOES NOT EXIST`).build();
        }
        if (targetRoom.getGamePhase() === GAME_PHASE.GAME) {
            return Response.forRequest(packet)
                .withFailure('Cannot join when game is already started')
                .build();
        }
    },
    onJoin(player, packet) {
        const payload = Packet.getPayload(packet, priselpb.JoinRequest.getRootAsJoinRequest);
        if (isNull(payload)) {
            return;
        }
        const roomId = payload.roomId();
        const room = player.joinRoom(roomId);
        if (isNull(room)) {
            debug(`Cannot join a room for Id ${roomId} because the room is not found`);
            return;
        }
        room.updateStateToken();
        player.respond(
            Response.forRequest(packet)
                .withPayloadBuilder((builder) => {
                    const roomInfoOffset = room.buildRoomInfo(builder);
                    const roomStateOffset = buildRoomStateSnapshot(builder, room);
                    priselpb.JoinResponse.startJoinResponse(builder);
                    priselpb.JoinResponse.addRoom(builder, roomInfoOffset);
                    priselpb.JoinResponse.addRoomState(builder, roomStateOffset);
                    return priselpb.JoinResponse.endJoinResponse(builder);
                })
                .build(),
        );
        broadcast(room.getPlayers(), (playerInRoom) => {
            if (playerInRoom === player) {
                return;
            }
            return Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                .withPayloadBuilder((builder) => {
                    const playerJoinOffset = priselpb.PlayerJoinInfo.createPlayerJoinInfo(
                        builder,
                        player.buildPlayerInfo(builder),
                    );
                    const tokenOffset = builder.createString(room.getStateToken());

                    priselpb.RoomStateChangePayload.startRoomStateChangePayload(builder);

                    priselpb.RoomStateChangePayload.addChangeType(
                        builder,
                        priselpb.RoomStateChangeInfo.PlayerJoinInfo,
                    );
                    priselpb.RoomStateChangePayload.addChange(builder, playerJoinOffset);
                    priselpb.RoomStateChangePayload.addToken(builder, tokenOffset);

                    return priselpb.RoomStateChangePayload.endRoomStateChangePayload(builder);
                })
                .build();
        });
        // TODO(minor): currently, room members can grow infinitely. needs to
        // check gameConfig.maxPlayers
    },
    preLeave(player, packet) {
        if (!player.getRoom()) {
            return Response.forRequest(packet).withFailure(`NOT IN A ROOM`).build();
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

        if (isNull(currentRoom)) {
            return Response.forRequest(packet).withFailure('NOT IN A ROOM').build();
        }
        if (currentRoom.getGamePhase() === GAME_PHASE.GAME) {
            return Response.forRequest(packet).withFailure('GAME ALREADY STARTED').build();
        }
        if (player !== currentRoom.getHost()) {
            return Response.forRequest(packet)
                .withFailure('NOT ENOUGH PRIVILEGE TO START GAME')
                .build();
        }
        if (canStart && !canStart(currentRoom)) {
            return Response.forRequest(packet)
                .withFailure('GAME_CONFIG DISALLOW STARTING GAME')
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
            currentRoom.updateStateToken();

            broadcast(
                currentRoom.getPlayers(),
                Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                    .withPayloadBuilder((builder) => {
                        const playerLeaveOffset = priselpb.PlayerLeaveInfo.createPlayerLeaveInfo(
                            builder,
                            builder.createString(player.getId()),
                        );
                        const tokenOffset = builder.createString(player.getId());

                        const f = priselpb.RoomStateChangePayload;

                        f.startRoomStateChangePayload(builder);

                        f.addChangeType(builder, priselpb.RoomStateChangeInfo.PlayerLeaveInfo);
                        f.addChange(builder, playerLeaveOffset);
                        f.addToken(builder, tokenOffset);
                        return f.endRoomStateChangePayload(builder);
                    })
                    .build(),
            );
            return;
        }
        // host left, replace host
        const newHost = currentRoom.getPlayers()[0];
        currentRoom.setHost(newHost);

        currentRoom.updateStateToken();

        broadcast(
            currentRoom.getPlayers(),
            Packet.forSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE)
                .withPayloadBuilder((builder) => {
                    const tokenOffset = builder.createString(currentRoom.getStateToken());
                    const hostLeaveOffset = priselpb.HostLeaveInfo.createHostLeaveInfo(
                        builder,
                        builder.createString(player.getId()),
                        builder.createString(newHost.getId()),
                    );

                    const f = priselpb.RoomStateChangePayload;
                    f.startRoomStateChangePayload(builder);

                    f.addChangeType(builder, priselpb.RoomStateChangeInfo.HostLeaveInfo);
                    f.addChange(builder, hostLeaveOffset);
                    f.addToken(builder, tokenOffset);

                    return f.endRoomStateChangePayload(builder);
                })
                .build(),
        );
    }
}
