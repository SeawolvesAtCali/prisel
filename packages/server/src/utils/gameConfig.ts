// import { Handle } from './handle';
import { Player } from '../player';
import { Room } from '../room';

export interface FullGameConfig {
    /**
     * A unique identifier for this game in the server.
     */
    type: string;
    /**
     * The maximum number of players supported.
     */
    maxPlayers: number;
    /**
     * Check if all the preparation are done in order to start a new game.
     */
    canStart(room: Room): boolean;
    /**
     * Function invoked when game starts. This function is used to initialize game states.
     */
    onStart(room: Room): void;
    /**
     * Function invoked when a game is over. This is a good place
     * to persist some game state and present game results.
     * Game state will be automatically cleared after this function.
     */
    onEnd(room: Room): void;
    /**
     * Function invoked when a new player is added to the game.
     */
    onAddPlayer(room: Room, player: Player): void;
    /**
     * Function invoke when a player is removed from the game while the game is running.
     */
    onRemovePlayer(room: Room, player: Player): void;
}

export type GameConfig = Partial<FullGameConfig>;

export const BaseGameConfig: FullGameConfig = {
    type: 'game',
    maxPlayers: 10,
    canStart(room) {
        return true;
    },
    onStart(room) {},
    onEnd(room) {},
    onAddPlayer(room, player) {},
    onRemovePlayer(room, player) {},
};
