import { Room, newRoom, RoomConfig, RoomId } from './room';
import { Context } from './objects';
import { Packet, Request, Status, Response } from '@prisel/common';
import WebSocket from 'ws';
import { emit } from './utils/networkUtils';
import { getResponseFor } from './message';

export type PlayerId = string;

const DEFAULT_REQUEST_TIMEOUT = 1000;

export abstract class Player {
    public abstract getName(): string;
    public abstract getId(): PlayerId;
    public abstract getRoom(): Room | null;
    public abstract findRoomById(roomId: RoomId): Room | null;
    public abstract createRoom(config: Omit<RoomConfig, 'id'>): Room;
    public abstract joinRoom(roomId: RoomId): Room | null;
    public abstract leaveRoom(): void;
    public abstract emit<T extends Packet<any>>(packet: T): T | void;
    public abstract request<T>(
        request: Omit<Request<T>, 'id'>,
        timeout?: number,
    ): Promise<Response>;
    public abstract respond<T = never>(request: Request<any>, status: Status, payload?: T): void;
    public abstract getSocket(): WebSocket;
}

export interface PlayerConfig {
    name: string;
    id: string;
}
/* tslint:disable: max-classes-per-file*/
class PlayerImpl extends Player {
    private room: Room = null;
    private context: Context;
    private id: string;
    private name: string;
    constructor(context: Context, config: PlayerConfig) {
        super();
        this.context = context;
        this.id = config.id;
        this.name = config.name;
    }
    public getSocket(): WebSocket {
        return this.context.SocketManager.getSocket(this.id);
    }

    public getName() {
        return this.name;
    }

    public getId() {
        return this.id;
    }
    public newRequestId() {
        return this.context.newRequestId();
    }
    public getRoom() {
        return this.room;
    }
    public createRoom(config: Omit<RoomConfig, 'id'>) {
        return newRoom(this.context, config);
    }

    public findRoomById(roomId: RoomId) {
        return this.context.rooms.get(roomId) || null;
    }

    public joinRoom(roomId: RoomId) {
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

    public emit<T extends Packet<any>>(packet: T) {
        setImmediate(emit, this.getSocket(), packet);
    }

    public request<T>(request: Omit<Request<T>, 'id'>, timeout = DEFAULT_REQUEST_TIMEOUT) {
        const fullRequest: Request<T> = {
            ...request,
            id: this.newRequestId(),
        };
        this.emit(fullRequest);
        return this.context.requests.addRequest(fullRequest, timeout);
    }

    public respond<T = never>(request: Request<any>, status: Status, payload?: T) {
        this.emit(getResponseFor(request, status, payload));
    }
}

export function newPlayer(context: Context, config: PlayerConfig): Player {
    if (context.players.has(config.id)) {
        return context.players.get(config.id);
    }
    const player = new PlayerImpl(context, config);
    context.players.set(config.id, player);
    return player;
}
