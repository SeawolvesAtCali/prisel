import { EventEmitter } from 'events';

import { Player } from './player';
import { Context } from './objects';
import { GAME_PHASE } from './objects/gamePhase';
import { newId } from './utils/idUtils';
import { Packet, PacketType } from '@prisel/common';

export type RoomId = string;

type RemoveListenerFunc = () => void;
type PacketListener<T extends Packet<any>> = (player: Player, packet: T, action: any) => void;

// replace handle to control room related info
export interface Room {
    removePlayer(player: Player): void;
    startGame(): void;
    endGame(): void;
    getGamePhase(): GAME_PHASE;
    getGameCapacity(): number;
    getPlayers(): Player[];
    getHost(): Player;
    setHost(player: Player): void;
    addPlayer(player: Player): void;
    getId(): string;
    getName(): string;
    /**
     * Called when everybody left room and the room is ready to be clean up.
     */
    close(): void;
    setGame<Game = any>(game: Game): void;
    getGame<Game = any>(): Game;
    listenGamePacket<T extends Packet<any> = Packet<any>>(
        action: any,
        onPacket: PacketListener<T>,
    ): RemoveListenerFunc;
    removeAllGamePacketListener(): void;
    dispatchGamePacket(packet: Packet, player: Player): void;
}

export interface RoomConfig {
    name: string;
    id: RoomId;
}

/* tslint:disable: max-classes-per-file*/
class RoomImpl implements Room {
    private context: Context;
    private players: Player[] = [];
    private host: Player;
    private name: string;
    private id: string;
    private gamePhase: GAME_PHASE = GAME_PHASE.WAITING;
    private game: any;
    private actionListeners: EventEmitter = new EventEmitter();

    constructor(context: Context, config: RoomConfig) {
        this.context = context;
        this.name = config.name;
        this.id = config.id;

        this.context.gameConfig.onSetup(this);
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
        this.context.gameConfig.onSetup(this);
    }
    public getGameCapacity() {
        return this.context.gameConfig.maxPlayers;
    }

    public getPlayers() {
        return this.players;
    }
    public addPlayer(player: Player) {
        // TODO(minor): find player based on player Id instead of instance
        if (!this.players.includes(player)) {
            this.players = [...this.players, player];
        }
    }
    public removePlayer(player: Player) {
        this.players = this.players.filter((playerInRoom) => playerInRoom !== player);
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
        // TODO(minor): for safty, clean up other things, like remaining
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

    public dispatchGamePacket(packet: Packet, player: Player) {
        const { action } = packet;
        if (action === undefined) {
            return;
        }

        // RESPONSE should be handled directly using promise.
        // only handle PACKET and REQUEST
        if (packet.type === PacketType.RESPONSE) {
            return;
        }
        setImmediate(() => {
            this.actionListeners.emit(action, player, packet, action);
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
