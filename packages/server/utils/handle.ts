import { Context, AnyObject } from '../objects';
import { emit } from './networkUtils';
import { getMessage } from '../message';
import { ClientId } from '../objects/client';
import { RoomId, Room } from '../objects/room';
import { MessageType } from '@prisel/common';
import { GAME_PHASE } from '../objects/gamePhase';
import { GameConfig, BaseGameConfig } from './gameConfig';
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
    public roomId: RoomId;
    public game: GameConfig;
    public room: RoomConfig;

    private context: Context;

    constructor({ context, roomId, gameConfig, roomConfig }: HandleProps) {
        this.context = context;
        this.roomId = roomId;
        this.game = gameConfig;
        this.room = roomConfig;
    }

    /**
     * Emit a MESSAGE event to client
     * @param playerId
     * @param data
     */
    public emit(playerId: ClientId, data: any): void;
    /**
     * Emit an event to client
     * @param playerId
     * @param messageType
     * @param data
     */
    public emit(playerId: ClientId, messageType: MessageType, data: any): void;
    public emit(playerId: ClientId, ...rest: any[]) {
        emitWithPlayerId(this.context, playerId, rest[0], rest[1]);
    }

    public broadcast(playerIds: ClientId[], data: any): void;
    public broadcast(playerIds: ClientId[], messageType: MessageType, data: any): void;
    public broadcast(playerIds: ClientId[], ...rest: any[]) {
        playerIds.forEach((playerId) => {
            emitWithPlayerId(this.context, playerId, rest[0], rest[1]);
        });
    }

    public broadcastRoomUpdate() {
        updateClientWithRoomData(this.context, this.roomId);
    }

    /**
     * Update game state.
     * @param producerOrState
     */
    public setState<T extends object>(producerOrState: ((draftState: T) => void) | Partial<T>): T {
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

    public canStart() {
        return (this.game.canStart || BaseGameConfig.canStart)(this);
    }

    public startGame() {
        this.updateRoomState((draftRoom) => {
            draftRoom.gamePhase = GAME_PHASE.GAME;
        });
        (this.game.onStart || BaseGameConfig.onStart)(this);
    }

    public endGame() {
        this.updateRoomState((draftRoom) => {
            draftRoom.gamePhase = GAME_PHASE.WAITING;
        });
        (this.game.onEnd || BaseGameConfig.onEnd)(this);
    }

    public get gamePhase() {
        const room = this.getRoom();
        if (room) {
            return room.gamePhase;
        }
    }

    public addPlayer(playerId: ClientId) {
        this.context.updateState((draftState) => {
            draftState.connections[playerId].roomId = this.roomId;
        });
        this.updateRoomState((draftRoom) => {
            if (!draftRoom.players.includes(playerId)) {
                draftRoom.players.push(playerId);
            }
        });
        (this.game.onAddPlayer || BaseGameConfig.onAddPlayer)(this, playerId);
    }

    public removePlayer(playerId: ClientId) {
        this.context.updateState((draftState) => {
            delete draftState.connections[playerId].roomId;
        });
        this.updateRoomState((draftRoom) => {
            draftRoom.players.splice(draftRoom.players.indexOf(playerId), 1);
            if (draftRoom.host === playerId) {
                delete draftRoom.host;
            }
        });
        (this.game.onRemovePlayer || BaseGameConfig.onRemovePlayer)(this, playerId);
    }

    public get players() {
        const room = this.getRoom();
        if (room) {
            return room.players;
        }
        return [];
    }

    public removeRoom() {
        this.context.updateState((draftState) => {
            delete draftState.rooms[this.roomId];
        });
        this.roomId = undefined;
        // TODO: how do we notify outside that room is removed.
    }

    public setHost(playerId: ClientId) {
        this.updateRoomState((draftRoom) => {
            if (draftRoom.players.includes(playerId)) {
                draftRoom.host = playerId;
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

function emitWithPlayerId(context: Context, playerId: ClientId, ...rest: any[]): void {
    const message: [MessageType, any] =
        rest.length === 1 ? getMessage(rest[0]) : (rest as [MessageType, any]);
    const { SocketManager } = context;
    const clientSocket = SocketManager.getSocket(playerId);
    if (clientSocket) {
        emit(clientSocket, ...message);
    }
}

export default Handle;
