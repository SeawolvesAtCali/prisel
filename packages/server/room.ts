import { Packet, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { EventEmitter } from 'events';
import debug from './debug';
import { DEBUG_MODE } from './flags';
import { getError } from './message';
import { Context } from './objects';
import { GAME_PHASE } from './objects/gamePhase';
import { Player } from './player';
import { newId } from './utils/idUtils';
import { safeStringify } from './utils/safeStringify';

export type RoomId = string;

export type RemoveListenerFunc = () => void;
type PacketListener = (player: Player, packet: Packet, action: any) => void;

// replace handle to control room related info
export interface Room {
    removePlayer(player: Player): void;
    startGame(): void;
    endGame(): void;
    getGamePhase(): GAME_PHASE;
    getGameCapacity(): number;
    getPlayers(): Player[];
    hasPlayer(player: Player): boolean;
    getHost(): Player | undefined;
    setHost(player: Player): void;
    addPlayer(player: Player): void;
    getId(): string;
    getName(): string;
    /**
     * Called when everybody left room and the room is ready to be clean up.
     */
    close(): void;
    isClosed: boolean;
    setGame<Game = any>(game: Game): void;
    getGame<Game = any>(): Game;
    listenGamePacket(action: any, onPacket: PacketListener): RemoveListenerFunc;
    removeAllGamePacketListener(): void;
    dispatchGamePacket(packet: Packet, player: Player): void;
    equals(room: Room): boolean;
    updateStateToken(): priselpb.UpdateToken;
    getStateToken(): string;
}

export interface RoomOption {
    name: string;
    id: RoomId;
}

/* tslint:disable: max-classes-per-file*/
class RoomImpl implements Room {
    private context;
    private players: Player[] = [];
    private host?: Player;
    private name;
    private id;
    private gamePhase: GAME_PHASE = GAME_PHASE.WAITING;
    private game: any;
    private actionListeners: EventEmitter = new EventEmitter();
    private currentToken = 0;
    private closed = false;

    constructor(context: Context, config: RoomOption) {
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
    public hasPlayer(player: Player) {
        return this.getPlayers().some((playerInRoom) => playerInRoom.equals(player));
    }
    public addPlayer(player: Player) {
        if (!this.players.includes(player)) {
            this.players = [...this.players, player];
        }
    }
    public removePlayer(player: Player) {
        this.players = this.players.filter((playerInRoom) => playerInRoom !== player);
        if (player.equals(this.host)) {
            this.host = undefined;
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
        this.closed = true;
    }

    get isClosed(): boolean {
        return this.closed;
    }

    public listenGamePacket(action: any, onPacket: PacketListener) {
        this.actionListeners.on(action, onPacket);
        return this.actionListeners.off.bind(this.actionListeners, action, onPacket);
    }

    public removeAllGamePacketListener() {
        this.actionListeners.removeAllListeners();
    }

    public updateStateToken(): priselpb.UpdateToken {
        const previousToken = this.getStateToken();
        this.currentToken = this.currentToken + 1;
        return {
            previousToken,
            token: this.getStateToken(),
        };
    }
    public equals(room: Room): boolean {
        if (!room) {
            return false;
        }
        return this.getId() === room.getId();
    }
    public getStateToken(): string {
        return `${this.currentToken}`;
    }

    public dispatchGamePacket(packet: Packet, player: Player) {
        const action = Packet.getAction(packet);
        if (action === undefined) {
            return;
        }

        // RESPONSE should be handled directly using promise.
        // only handle PACKET and REQUEST
        // TODO(minor) there is no detection for where a response is proccessed.
        // But this might not be an issue if we don't require all response to be
        // processed.
        if (Response.isResponse(packet)) {
            return;
        }
        setImmediate(() => {
            if (this.actionListeners.listenerCount(action) === 0) {
                // no listener currently subscribe to this action
                debug(`no game action listener is listening for ${action}`);
                if (Request.isRequest(packet)) {
                    player.respond(
                        Response.forRequest(packet)
                            .setFailure(
                                'no game action listener is listening for this request',
                                DEBUG_MODE ? safeStringify(packet) : undefined,
                            )
                            .build(),
                    );
                } else {
                    // type === Packet
                    player.emit(
                        getError(
                            'no game action listener is listening for this packet',
                            DEBUG_MODE ? safeStringify(packet) : undefined,
                        ),
                    );
                }
            } else {
                this.actionListeners.emit(action, player, packet, action);
            }
        });
    }
}

export function newRoom(context: Context, option: Omit<RoomOption, 'id'>): Room {
    const { name } = option;
    const id = newId<RoomId>('ROOM');
    const room = new RoomImpl(context, {
        name,
        id,
    });
    context.rooms.set(id, room);
    return room;
}
