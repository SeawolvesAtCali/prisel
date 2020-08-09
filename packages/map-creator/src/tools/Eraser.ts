import { Coordinate, PropertyClass, TileClass, World } from '@prisel/monopoly-common';
import { CanvasForm, Pt } from 'pts';
import { equal } from '../common';
import { LayerType } from '../Layer';
import { clearTilePath } from './clearTilePath';
import { Tool } from './Tool';

export class Eraser implements Tool {
    constructor(private world: World, private form: CanvasForm) {}

    public onDraw(coor: Coordinate, _: Pt, layer: LayerType): void {
        if (layer === LayerType.TILE) {
            const currentTile = this.world
                .getAll(TileClass)
                .find((tile) => equal(tile.position, coor));

            if (currentTile) {
                clearTilePath(currentTile, this.world);
                this.world.remove(currentTile);
            }
        }
        if (layer === LayerType.PROPERTY) {
            const currentProperty = this.world
                .getAll(PropertyClass)
                .find((property) => equal(property.dimension.anchor, coor));
            if (currentProperty) {
                this.world.remove(currentProperty);
            }
        }
    }
}
