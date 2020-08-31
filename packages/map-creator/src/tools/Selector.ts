import { Coordinate, PropertyClass, TileClass, World } from '@prisel/monopoly-common';
import { CanvasForm, Pt } from 'pts';
import { CanvasOps } from '../CanvasOps';
import { equal } from '../common';
import { deselectObject, selectObject, tempSelectObject } from '../events';
import { LayerType } from '../Layer';
import { Tool } from './Tool';

export class Selector implements Tool {
    constructor(private world: World, private form: CanvasForm, private ops: CanvasOps) {}

    onUp(coor: Coordinate, _: Pt, layer: LayerType) {
        if (this.ops.tempSelectingConfig) {
            // temp selecting
            const { tempSelectingConfig } = this.ops;
            switch (tempSelectingConfig.layer) {
                case LayerType.TILE:
                    const tile = this.world
                        .getAll(TileClass)
                        .find((tile) => equal(tile.position, coor));
                    if (tile) {
                        tempSelectObject.pub(tile);
                    }
                    break;
                case LayerType.PROPERTY:
                    const property = this.world
                        .getAll(PropertyClass)
                        .find((property) => equal(property.dimension.anchor, coor));
                    if (property) {
                        tempSelectObject.pub(property);
                    }
                    break;
            }
        } else {
            // regular selecting
            switch (layer) {
                case LayerType.TILE:
                    const tile = this.world
                        .getAll(TileClass)
                        .find((tile) => equal(tile.position, coor));
                    if (tile) {
                        selectObject.pub(tile);
                    } else {
                        deselectObject.pub();
                    }
                    break;
                case LayerType.PROPERTY:
                    const property = this.world
                        .getAll(PropertyClass)
                        .find((property) => equal(property.dimension.anchor, coor));
                    if (property) {
                        selectObject.pub(property);
                    } else {
                        deselectObject.pub();
                    }
            }
        }
    }
}
