import { PlayerInfo } from '@prisel/common';
import { Coordinate } from './coordinate';
/**
 * Information about a game character that player controls
 */
export interface GamePlayerInfo {
    money: number;
    player: PlayerInfo;
    pos: Coordinate;
    // character determine the sprite set, or color client side use to
    // denote the player
    character: number;
}
