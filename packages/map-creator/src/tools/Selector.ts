import { Coordinate, PropertyClass, TileClass, World } from '@prisel/monopoly-common';
import { CanvasForm, Pt } from 'pts';
import { CanvasOps } from '../CanvasOps';
import { equal } from '../common';
import { LayerType } from '../Layer';
import { Tool } from './Tool';

export class Selector implements Tool {
    constructor(private world: World, private form: CanvasForm, private ops: CanvasOps) {}

    onUp(coor: Coordinate, _: Pt, layer: LayerType) {
        if (layer === LayerType.PROPERTY) {
            const property = this.world
                .getAll(PropertyClass)
                .find((property) => equal(property.dimension.anchor, coor));
            if (property) {
                this.ops.selectObject(property);
            } else {
                this.ops.selectObject(undefined);
            }
        }
        if (layer === LayerType.TILE) {
            const tile = this.world.getAll(TileClass).find((tile) => equal(tile.position, coor));
            if (tile) {
                this.ops.selectObject(tile);
            } else {
                this.ops.selectObject(undefined);
            }
        }
    }
}
