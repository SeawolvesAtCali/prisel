import { Tile } from './tile';
import { CoordinatePair } from './coordinatePair';

export interface BoardSetup {
    height: number;
    width: number;
    tiles: Tile[];
    roadPropertyMapping: CoordinatePair[];
}
