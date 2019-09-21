import { Handle } from './handle';
import { ClientId } from '../objects/client';
import { AnyObject } from '../objects';

interface FullGameConfig {
    /**
     * A unique identifier for this game in the server.
     */
    type: string;
    /**
     * The maximum number of players supported.
     */
    maxPlayers: number;
    /**
     * Function invoked at room creation time and after a game ends.
     * This is a good place to initialize pre game state.
     */
    onSetup: (handle: Handle) => AnyObject | void;
    /**
     * Check if all the preparation are done in order to start a new game.
     */
    canStart: (handle: Handle) => boolean;
    /**
     * Function invoked when game starts. This function is used to initialize game states.
     */
    onStart: (handle: Handle) => void;
    /**
     * Function invoked when a game is over. This is a good place
     * to persist some game state and present game results.
     * Game state will be automatically cleared after this function.
     */
    onEnd: (handle: Handle) => void;
    /**
     * Function invoked when receiving a message from client. This is a good
     * place to update game state based on client input.
     */
    onMessage: (handle: Handle, player: ClientId, data: any) => void;
    /**
     * Function invoked when a new player is added to the game.
     */
    onAddPlayer: (handle: Handle, player: ClientId) => void;
    /**
     * Function invoke when a player is removed from the game.
     */
    onRemovePlayer: (handle: Handle, player: ClientId) => void;
}

export type GameConfig = Partial<FullGameConfig>;

export const BaseGameConfig: GameConfig = {
    type: 'game',
    maxPlayers: 10,
    onSetup(handle) {
        return {};
    },
    canStart(handle) {
        return true;
    },
    onStart(handle) {},
    onEnd(handle) {},
    onMessage(handle, player, data) {},
    onAddPlayer(handle, player) {},
    onRemovePlayer(handle, player) {},
};
