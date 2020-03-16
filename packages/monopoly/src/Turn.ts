import Game from './Game';
import { GamePlayer } from './GamePlayer';
import { Action } from './messages';
import { ResponseWrapper, RemoveListenerFunc, Request, debug } from '@prisel/server';

/**
 * Will be clear when done or when player's turn ends
 */
export interface SingleTurnRequestListener {
    action: Action;
    handle: (game: Game, packet: Request, player: GamePlayer) => ResponseWrapper;
    postHandle?: (game: Game, response: ResponseWrapper, player: GamePlayer) => void;
    isDone?: (game: Game, response: ResponseWrapper) => boolean;
}

export class Turn {
    private game: Game;
    private currentPlayer: GamePlayer;
    private offListeners: Set<RemoveListenerFunc> = new Set();
    private isActive: boolean;

    constructor(game: Game, player: GamePlayer) {
        this.game = game;
        this.currentPlayer = player;
        this.isActive = true;
    }

    public get player(): GamePlayer {
        return this.currentPlayer;
    }

    public runRequestListener(requestListener: SingleTurnRequestListener): Promise<void> {
        if (!this.isActive) {
            return Promise.reject('turn already ended');
        }
        return new Promise((resolve) => {
            const offListener = this.game.room.listenGamePacket<Request>(
                requestListener.action,
                (player, packet) => {
                    const requestPlayer = this.game.getGamePlayer(player);
                    if (!player.equals(this.currentPlayer.player)) {
                        player.respondFailure(packet, "not player's turn");
                        return;
                    }
                    const responseWrapper = requestListener.handle(
                        this.game,
                        packet,
                        requestPlayer,
                    );
                    player.emit(responseWrapper.get());
                    if (requestListener.postHandle) {
                        requestListener.postHandle(this.game, responseWrapper, requestPlayer);
                    }
                    if (
                        requestListener.isDone &&
                        requestListener.isDone(this.game, responseWrapper)
                    ) {
                        offListener();
                        resolve();
                    }
                },
            );
            this.offListeners.add(offListener);
        });
    }

    public end() {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        debug('Ending turn for %0', this.player.id);
        for (const off of this.offListeners) {
            off();
        }
    }
}

export function startTurn(game: Game, player: GamePlayer): Turn {
    return new Turn(game, player);
}
