import { Tile } from '@prisel/monopoly-common';
import { CanvasForm, Geom, Group, Pt } from 'pts';
import { tileCenter } from './tileCenter';

export function arrow(start: Pt, end: Pt, form: CanvasForm) {
    const line = new Group(start, end);
    const unit = end.$subtract(start);
    if (unit.magnitudeSq() === 0) {
        console.error(`cannot draw an arrow of length 0 at (${start.x}, ${start.y})`);
        return;
    }
    unit.unit();
    const ps = Geom.perpendicular(unit).multiply(7).add(end).subtract(unit.$multiply(7));
    form.strokeOnly('#000', 3).lines([line, new Group(ps[0], end, ps[1])]);
}

export function arrowBetweenTiles(startTile: Tile, endTile: Tile, form: CanvasForm) {
    const startCenter = tileCenter(startTile);
    const endCenter = tileCenter(endTile);
    const unit = endCenter.$subtract(startCenter).unit();
    arrow(startCenter.$add(unit.$multiply(5)), endCenter.$subtract(unit.$multiply(5)), form);
}
