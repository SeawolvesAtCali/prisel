import { Coordinate, World } from '@prisel/monopoly-common';
import { CanvasForm } from 'pts';
import { clearTilePath } from './clearTilePath';
import { getOrCreateCurrentTile } from './getOrCreateCurrentTile';
import { Tool } from './Tool';

export class EmptyTileBrush implements Tool {
    constructor(private world: World, private form: CanvasForm) {}

    public onDown(coor: Coordinate): void {}
    public onDraw(coor: Coordinate): void {
        const currentTile = getOrCreateCurrentTile(coor, this.world);
        clearTilePath(currentTile, this.world);
    }
}
