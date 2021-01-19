import { Property, Tile, World } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { CanvasForm, Pt } from 'pts';
import { equal } from '../common';
import { LayerType } from '../Layer';
import { clearTilePath } from './clearTilePath';
import { Tool } from './Tool';

type Coordinate = monopolypb.Coordinate;

export class Eraser implements Tool {
    constructor(private world: World, private form: CanvasForm) {}

    public onDraw(coor: Coordinate, _: Pt, layer: LayerType): void {
        if (layer === LayerType.TILE) {
            const currentTile = this.world.getAll(Tile).find((tile) => equal(tile.position, coor));

            if (currentTile) {
                clearTilePath(currentTile, this.world);
                this.world.remove(currentTile);
            }
        }
        if (layer === LayerType.PROPERTY) {
            const currentProperty = this.world
                .getAll(Property)
                .find((property) => equal(property.anchor, coor));
            if (currentProperty) {
                this.world.remove(currentProperty);
            }
        }
    }
}
