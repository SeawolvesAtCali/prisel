import { Tile, World } from '@prisel/monopoly-common';
import { coordinate } from '@prisel/protos';
import { CanvasForm } from 'pts';
import { getOrCreateCurrentTile } from './getOrCreateCurrentTile';
import { pathConnect } from './pathConnect';
import { Tool } from './Tool';

export class PathTileBrush implements Tool {
    private previousTile: Tile | undefined;
    constructor(private world: World, private form: CanvasForm) {}

    public onDown(coor: coordinate.Coordinate): void {
        this.previousTile = undefined;
    }
    public onDraw(coor: coordinate.Coordinate): void {
        const tileAtCurrentCoor = getOrCreateCurrentTile(coor, this.world);

        if (!this.previousTile) {
            this.previousTile = tileAtCurrentCoor;
            return;
        }
        if (this.previousTile !== tileAtCurrentCoor) {
            pathConnect(this.previousTile, tileAtCurrentCoor, this.world);
            this.previousTile = tileAtCurrentCoor;
        }
    }
}
