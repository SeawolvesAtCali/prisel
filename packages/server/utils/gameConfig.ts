import Handle from './handle';
import { ClientId } from '../objects/client';

export interface GameConfig {
    /**
     * A unique identifier for this game in the server.
     */
    type: string;
    /**
     * The number of players supported. If one number is given,
     * the game needs exact number of players. If two numbers are given, the number of player
     * needs to be between the two number inclusively.
     */
    playerRange: [number] | [number, number];
    /**
     * Function invoked at room creation time and after a game ends.
     * This is a good place to initialize pre game state.
     */
    init: (handle: Handle) => void;
    /**
     * Function invoked upon a request to start the game.
     * This is a good place to check if all pre game preparation is complete.
     * Return true to indicate game can start, false otherwise.
     * Game state initialization should also happen in this function.
     */
    start: (handle: Handle) => boolean;
    /**
     * Function invoked when a game is over. This is a good place
     * to persist some game state and present game results.
     * Game state will be automatically cleared after this function.
     */
    end: (handle: Handle) => void;
    /**
     * Function invoked when receiving a message from client. This is a good
     * place to update game state based on client input.
     */
    handleMessage: (handle: Handle, player: ClientId, data: any) => void;
    /**
     * Function invoked when a new player is added to the game.
     */
    addPlayer: (handle: Handle, player: ClientId) => void;
    /**
     * Function invoke when a player is removed from the game.
     */
    removePlayer: (handle: Handle, player: ClientId) => void;
}

export const BaseGameConfig: GameConfig = {
    type: 'game',
    playerRange: [2],
    init(handle) {},
    start(handle) {
        return true;
    },
    end(handle) {},
    handleMessage(handle, player, data) {},
    addPlayer(handle, player) {},
    removePlayer(handle, player) {},
};
