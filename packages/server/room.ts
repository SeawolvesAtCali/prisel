import { EventEmitter } from 'events';

import { Player } from './player';
import { Context } from './objects';
import { GAME_PHASE } from './objects/gamePhase';
import { newId } from './utils/idUtils';
import { Packet, PacketType, isRequest, ErrorPayload, UpdateToken } from '@prisel/common';
import debug from './debug';
import { DEBUG_MODE } from './flags';

export type RoomId = string;

export type RemoveListenerFunc = () => void;
type PacketListener<T extends Packet<any>> = (player: Player, packet: T, action: any) => void;

// replace handle to control room related info
export abstract class Room {
    public abstract removePlayer(player: Player): void;
    public abstract startGame(): void;
    public abstract endGame(): void;
    public abstract getGamePhase(): GAME_PHASE;
    public abstract getGameCapacity(): number;
    public abstract getPlayers(): Player[];
    public hasPlayer(player: Player): boolean {
        return this.getPlayers().some((playerInRoom) => playerInRoom.equals(player));
    }
    public abstract getHost(): Player;
    public abstract setHost(player: Player): void;
    public abstract addPlayer(player: Player): void;
    public abstract getId(): string;
    public abstract getName(): string;
    /**
     * Called when everybody left room and the room is ready to be clean up.
     */
    public abstract close(): void;
    public abstract setGame<Game = any>(game: Game): void;
    public abstract getGame<Game = any>(): Game;
    public abstract listenGamePacket<T extends Packet<any> = Packet<any>>(
        action: any,
        onPacket: PacketListener<T>,
    ): RemoveListenerFunc;
    public abstract removeAllGamePacketListener(): void;
    public abstract dispatchGamePacket(packet: Packet, player: Player): void;
    public equals(room: Room): boolean {
        if (!room) {
            return false;
        }
        return this.getId() === room.getId();
    }

    public abstract updateStateToken(): UpdateToken;
    public abstract getStateToken(): string;
}

export interface RoomConfig {
    name: string;
    id: RoomId;
}

/* tslint:disable: max-classes-per-file*/
class RoomImpl extends Room {
    private context: Context;
    private players: Player[] = [];
    private host: Player;
    private name: string;
    private id: string;
    private gamePhase: GAME_PHASE = GAME_PHASE.WAITING;
    private game: any;
    private actionListeners: EventEmitter = new EventEmitter();
    private currentToken = 0;

    constructor(context: Context, config: RoomConfig) {
        super();
        this.context = context;
        this.name = config.name;
        this.id = config.id;
    }
    public getGamePhase() {
        return this.gamePhase;
    }
    public startGame() {
        this.gamePhase = GAME_PHASE.GAME;
        this.context.gameConfig.onStart(this);
    }
    public endGame() {
        this.gamePhase = GAME_PHASE.WAITING;
        this.context.gameConfig.onEnd(this);
    }
    public getGameCapacity() {
        return this.context.gameConfig.maxPlayers;
    }

    public getPlayers() {
        return this.players;
    }
    public addPlayer(player: Player) {
        if (!this.players.includes(player)) {
            this.players = [...this.players, player];
        }
    }
    public removePlayer(player: Player) {
        this.players = this.players.filter((playerInRoom) => playerInRoom !== player);
        if (player.equals(this.host)) {
            this.host = null;
        }
    }
    public getHost() {
        return this.host;
    }
    public setHost(player: Player) {
        if (this.players.includes(player)) {
            this.host = player;
        }
    }

    public getId() {
        return this.id;
    }

    public getName() {
        return this.name;
    }

    public setGame<Game>(game: Game) {
        this.game = game;
    }

    public getGame<Game>() {
        return this.game as Game;
    }

    public close() {
        // TODO(minor): for safety, clean up other things, like remaining
        // players, on-going games
        this.actionListeners.removeAllListeners();
        this.gamePhase = GAME_PHASE.WAITING;
        this.context.rooms.delete(this.id);
    }

    public listenGamePacket<T extends Packet<any> = Packet<any>>(
        action: any,
        onPacket: PacketListener<T>,
    ) {
        this.actionListeners.on(action, onPacket);
        return this.actionListeners.off.bind(this, action, onPacket);
    }

    public removeAllGamePacketListener() {
        this.actionListeners.removeAllListeners();
    }

    public updateStateToken(): UpdateToken {
        const previousToken = this.getStateToken();
        this.currentToken = this.currentToken + 1;
        return {
            previousToken,
            token: this.getStateToken(),
        };
    }

    public getStateToken(): string {
        return `${this.currentToken}`;
    }

    public dispatchGamePacket(packet: Packet, player: Player) {
        const { action } = packet;
        if (action === undefined) {
            return;
        }

        // RESPONSE should be handled directly using promise.
        // only handle PACKET and REQUEST
        // TODO(minor) there is no detection for where a response is proccessed.
        // But this might not be an issue if we don't require all response to be
        // processed.
        if (packet.type === PacketType.RESPONSE) {
            return;
        }
        setImmediate(() => {
            if (this.actionListeners.listenerCount(action) === 0) {
                // no listener currently subscribe to this action
                debug(`no game action listener is listening for ${action}`);
                if (isRequest(packet)) {
                    if (DEBUG_MODE) {
                        player.respondFailure(
                            packet,
                            'no game action listener is listening for this package',
                            packet,
                        );
                    } else {
                        player.respondFailure(packet);
                    }
                } else {
                    // type === Packet
                    if (DEBUG_MODE) {
                        player.emit<Packet<ErrorPayload>>({
                            type: PacketType.DEFAULT,
                            payload: {
                                message: 'no game action listener is listening for this package',
                                detail: packet,
                            },
                        });
                    }
                }
            } else {
                this.actionListeners.emit(action, player, packet, action);
            }
        });
    }
}

export function newRoom(context: Context, config: Omit<RoomConfig, 'id'>): Room {
    const { name } = config;
    const id = newId<RoomId>('ROOM');
    const room = new RoomImpl(context, {
        name,
        id,
    });
    context.rooms.set(id, room);
    return room;
}
