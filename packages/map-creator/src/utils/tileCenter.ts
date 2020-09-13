import { Tile2 } from '@prisel/monopoly-common';
import { Pt } from 'pts';
import { TILE_SIZE_PX } from '../common';

const HALF_TILE_PX = TILE_SIZE_PX / 2;
export function tileCenter(tile: Tile2): Pt {
    return new Pt(
        tile.position.col * TILE_SIZE_PX + HALF_TILE_PX,
        tile.position.row * TILE_SIZE_PX + HALF_TILE_PX,
    );
}
