import {
    assertExist,
    BufferOffset,
    isNull,
    PacketView,
    RequestBuilder,
    Response,
    Token,
} from '@prisel/common';
import { priselpb } from '@prisel/protos';
import * as flatbuffers from 'flatbuffers';
import WebSocket from 'ws';
import { Context } from './objects';
import { newRoom, Room, RoomId, RoomOption } from './room';
import { emit } from './utils/networkUtils';

export type PlayerId = string;

const DEFAULT_REQUEST_TIMEOUT = 1000;

export interface Player {
    getName(): string;
    getId(): PlayerId;
    buildPlayerInfo(builder: flatbuffers.Builder): BufferOffset;
    getRoom(): Room | null;
    findRoomById(roomId: RoomId | null): Room | null;
    createRoom(config: Omit<RoomOption, 'id'>): Room;
    joinRoom(roomId: RoomId | null): Room | null;
    leaveRoom(): void;
    emit(packet: PacketView): void;
    /**
     * Send a request to client
     * @param requestBuilder partial Request. no need to specify requstId as it will
     * be auto populated
     * @param token cancellationToken
     */
    request(requestBuilder: RequestBuilder, token?: Token): Promise<Response>;
    respond(response: PacketView<Response>): void;
    getSocket(): WebSocket;
    equals(player: Player | undefined): boolean;
}

export interface PlayerOption {
    name: string;
    id: string;
}
/* tslint:disable: max-classes-per-file*/
class PlayerImpl implements Player {
    private room: Room | null = null;
    private context: Context;
    private id: string;
    private name: string;
    constructor(context: Context, config: PlayerOption) {
        this.context = context;
        this.id = config.id;
        this.name = config.name;
    }
    public getSocket(): WebSocket {
        return assertExist(this.context.SocketManager.getSocket(this.id));
    }

    public getName() {
        return this.name;
    }

    public getId() {
        return this.id;
    }
    public buildPlayerInfo(builder: flatbuffers.Builder) {
        return priselpb.PlayerInfo.createPlayerInfo(
            builder,
            builder.createString(this.name),
            builder.createString(this.id),
        );
    }
    public newRequestId() {
        return this.context.newRequestId();
    }
    public getRoom() {
        return this.room;
    }
    public createRoom(config: Omit<RoomOption, 'id'>) {
        return newRoom(this.context, config);
    }

    public findRoomById(roomId: RoomId | null) {
        if (isNull(roomId)) {
            return null;
        }
        return this.context.rooms.get(roomId) || null;
    }

    public joinRoom(roomId: RoomId | null) {
        const targetRoom = this.findRoomById(roomId);
        if (targetRoom) {
            this.room = targetRoom;
            targetRoom.addPlayer(this);
        }
        return this.room;
    }

    public leaveRoom() {
        if (this.room) {
            this.room.removePlayer(this);
            this.room = null;
        }
    }

    public emit(response: PacketView) {
        setImmediate(emit, this.getSocket(), response);
    }

    public async request(
        requestBuilder: RequestBuilder,
        token = Token.delay(DEFAULT_REQUEST_TIMEOUT),
    ) {
        const fullRequest = requestBuilder.setId(this.newRequestId()).build();
        this.emit(fullRequest);
        try {
            return await this.context.requests.addRequest(fullRequest[1], token);
        } catch (e) {
            return Response.forRequest(fullRequest[1]).withFailure(e.message).build()[1];
        }
    }

    public respond(response: PacketView<Response>) {
        this.emit(response);
    }
    public equals(player: Player): boolean {
        if (!player) {
            return false;
        }
        return this.getId() === player.getId();
    }
}

export function newPlayer(context: Context, config: PlayerOption): Player {
    const existingPlayer = context.players.get(config.id);
    if (existingPlayer) {
        return existingPlayer;
    }
    const player = new PlayerImpl(context, config);
    context.players.set(config.id, player);
    return player;
}
