import { Coordinate, Tile, World } from '@prisel/monopoly-common';
import { CanvasForm } from 'pts';
import { getOrCreateCurrentTile } from './getOrCreateCurrentTile';
import { pathConnect } from './pathConnect';
import { Tool } from './Tool';

export class PathTileBrush implements Tool {
    private previousTile: Tile | undefined;
    constructor(private world: World, private form: CanvasForm) {}

    public onDown(coor: Coordinate): void {
        this.previousTile = undefined;
    }
    public onDraw(coor: Coordinate): void {
        const tileAtCurrentCoor = getOrCreateCurrentTile(coor, this.world);
        tileAtCurrentCoor.path = tileAtCurrentCoor.path || { prev: [], next: [] };

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
