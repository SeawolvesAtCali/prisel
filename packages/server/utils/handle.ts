import { Context, AnyObject, StateManager } from '../objects';
import { emit } from './networkUtils';
import { getMessage } from '../message';
import { ClientId } from '../objects/client';
import { RoomId, Room } from '../objects/room';
import { MessageType } from '@prisel/common';
import { GAME_PHASE } from '../objects/gamePhase';
import { GameConfig } from './gameConfig';
import { RoomConfig } from './roomConfig';
import { updateClientWithRoomData } from './updateUtils';

interface HandleProps {
    context: Context;
    roomId: RoomId;
    gameConfig: GameConfig;
    roomConfig: RoomConfig;
}

/**
 * handle provides utilities to update room and game state
 * as well as performing network calls.
 */
class Handle {
    public game: GameConfig;
    public room: RoomConfig;

    public roomId: RoomId;
    private context: Context;

    constructor({ context, roomId, gameConfig, roomConfig }: HandleProps) {
        this.context = context;
        this.roomId = roomId;
        this.game = gameConfig;
        this.room = roomConfig;
    }

    /**
     * Emit a MESSAGE event to client
     * @param clientId
     * @param data
     */
    public emit(clientId: ClientId, data: any): void;
    /**
     * Emit an event to client
     * @param clientId
     * @param messageType
     * @param data
     */
    public emit(clientId: ClientId, messageType: MessageType, data: any): void;
    public emit(clientId: ClientId, ...rest: any[]) {
        emitWithClientId(this.context, clientId, rest[0], rest[1]);
    }

    public broadcast(clientIds: ClientId[], data: any): void;
    public broadcast(clientIds: ClientId[], messageType: MessageType, data: any): void;
    public broadcast(clientIds: ClientId[], ...rest: any[]) {
        clientIds.forEach((clientId) => {
            emitWithClientId(this.context, clientId, rest[0], rest[1]);
        });
    }

    public broadcastRoomUpdate() {
        updateClientWithRoomData(this.context, this.roomId);
    }

    /**
     * Update game state.
     * @param producerOrState
     */
    public setState<T extends object>(producerOrState: (draftState: T) => void | Partial<T>): T {
        return this.updateRoomState((draftRoom) => {
            if (typeof producerOrState === 'function') {
                const producer = producerOrState;
                producer(draftRoom.gameState);
                return;
            } else if (typeof producerOrState === 'object') {
                const state = producerOrState as Partial<T>;
                draftRoom.gameState = { ...draftRoom.gameState, ...state };
                return;
            }
            throw new Error(`cannot setState with ${typeof producerOrState}`);
        }).gameState;
    }

    /**
     * Get game state.
     */
    public get state(): AnyObject {
        const room = this.getRoom();
        if (room) {
            return room.gameState;
        }
    }

    /**
     * Clear game state.
     */
    public clearState() {
        this.updateRoomState((draftRoom) => {
            draftRoom.gameState = {};
        });
    }

    public startGame() {
        this.updateRoomState((draftRoom) => {
            draftRoom.gamePhase = GAME_PHASE.GAME;
        });
    }

    public endGame() {
        this.updateRoomState((draftRoom) => {
            draftRoom.gamePhase = GAME_PHASE.WAITING;
        });
    }

    public get gamePhase() {
        const room = this.getRoom();
        if (room) {
            return room.gamePhase;
        }
    }

    public addClient(clientId: ClientId) {
        this.updateRoomState((draftRoom) => {
            if (!draftRoom.clients.includes(clientId)) {
                draftRoom.clients.push(clientId);
            }
        });
    }

    public removeClient(clientId: ClientId) {
        this.updateRoomState((draftRoom) => {
            draftRoom.clients.splice(draftRoom.clients.indexOf(clientId));
            if (draftRoom.host === clientId) {
                delete draftRoom.host;
            }
        });
    }

    public get clients() {
        const room = this.getRoom();
        if (room) {
            return room.clients;
        }
        return [];
    }

    public removeRoom() {
        this.context.updateState((draftState) => {
            delete draftState.rooms[this.roomId];
        });
        // TODO: how do we notify outside that room is removed.
    }

    public setHost(clientId: ClientId) {
        this.updateRoomState((draftRoom) => {
            if (draftRoom.clients.includes(clientId)) {
                draftRoom.host = clientId;
            }
        });
    }

    public get host() {
        const room = this.getRoom();
        if (room) {
            return room.host;
        }
    }

    /**
     * All aspect of room data should be available through other getters.
     * This function is a workaround if we need something other getters doesn't provide it currently.
     */
    public get __dangerouslyGetRoom__() {
        return this.getRoom();
    }

    /**
     * All aspect of room data should be modifiable though other setters.
     * This function is a workaround if we need to modify something in the room
     * but no other setter supports currently.
     * @param producer
     */
    public __dangerouslyUpdateRoom__(producer: (room: Room) => void) {
        return this.updateRoomState(producer);
    }

    private updateRoomState(producer: (room: Room) => void) {
        return this.context.updateState((draftState) => {
            const room = draftState.rooms[this.roomId];
            if (room) {
                producer(room);
            }
        }).rooms[this.roomId];
    }
    private getRoom() {
        return this.context.StateManager.rooms[this.roomId];
    }
}

function emitWithClientId(context: Context, clientId: ClientId, ...rest: any[]): void {
    const message: [MessageType, any] =
        rest.length === 1 ? getMessage(rest[0]) : (rest as [MessageType, any]);
    const { SocketManager } = context;
    const clientSocket = SocketManager.getSocket(clientId);
    if (clientSocket) {
        emit(clientSocket, ...message);
    }
}

export default Handle;
