import {
    Coordinate,
    exist,
    GameObject,
    log,
    Property2,
    PropertyClass,
    Tile2,
    TileClass,
    World,
} from '@prisel/monopoly-common';
import {
    AnimateCallbackFn,
    CanvasForm,
    CanvasSpace,
    Color,
    Group,
    IPlayer,
    Num,
    Pt,
    Rectangle,
    Tempo,
} from 'pts';
import React from 'react';
import { AppContext } from './AppContext';
import { CanvasOps } from './CanvasOps';
import { TILE_SIZE_PX } from './common';
import { LayerType } from './Layer';
import { range } from './range';
import { toolCreatorMap } from './tools';
import { Tool } from './tools/Tool';
import { arrowBetweenTiles } from './utils/arrow';

const Palette = {
    BOARD: Color.fromHex('#9ab'),
    GRID: Color.fromHex('#123'),
    ROAD: Color.fromHex('#f5c542'),
    EMPTY: Color.fromHex('#96d989'),
    PROPERTY: Color.fromHex('#fff'),
    START: Color.fromHex('#123'),
};

function px(n: number): string {
    return `${n}px`;
}

export const Canvas: React.FC = () => {
    const context = React.useContext(AppContext);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const selectedObjectRef = React.useRef(context?.selectedObject);
    selectedObjectRef.current = context?.selectedObject;
    const [space, setSpace] = React.useState<CanvasSpace>();
    const [form, setForm] = React.useState<CanvasForm>();

    const hasContext = exist(context);
    const world = context?.world;
    const toolType = context?.tool;
    const layerType = context?.layer;
    const setSelectedObject = context?.setSelectedObject;
    const boardWidth = context?.width || 0;
    const boardHeight = context?.height || 0;
    const tool = React.useMemo(() => {
        if (form && world && toolType && setSelectedObject) {
            const ops: CanvasOps = {
                selectObject: setSelectedObject,
            };
            return new toolCreatorMap[toolType](world, form, ops);
        }
    }, [form, toolType, world, setSelectedObject]);
    React.useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        if (hasContext && world) {
            const space = new CanvasSpace(canvasRef.current).setup({
                bgcolor: Palette.BOARD.hex,
                retina: true,
            });
            const form = space.getForm();
            setSpace(space);
            setForm(form);

            space.add(getDrawGridFn(boardWidth, boardHeight, form));
            space.add(getDrawWorldFn(world, form, selectedObjectRef));
            space.bindMouse().bindTouch().play();
            return () => {
                space.dispose();
            };
        }
    }, [canvasRef, hasContext, boardHeight, boardWidth, selectedObjectRef, world]);
    React.useEffect(() => {
        if (space && world && layerType) {
            const drawTileFn = getHandleDrawTileFn(world, tool, layerType);
            space.add(drawTileFn);
            return () => {
                space.remove(drawTileFn);
            };
        }
    }, [world, space, tool, layerType]);
    return context ? (
        <canvas
            ref={canvasRef}
            style={{
                width: px(TILE_SIZE_PX * context.width),
                height: px(TILE_SIZE_PX * context.height),
            }}
        ></canvas>
    ) : null;
};

function getDrawGridFn(width: number, height: number, form: CanvasForm): AnimateCallbackFn {
    return function (_time, _ftime, space: CanvasSpace) {
        const bound = space.innerBound;
        const rowLines = range(1, height).map((index) => [
            new Pt(0, index * TILE_SIZE_PX),
            new Pt(bound.width, index * TILE_SIZE_PX),
        ]);
        const colLines = range(1, width).map((index) => [
            new Pt(index * TILE_SIZE_PX, 0),
            new Pt(index * TILE_SIZE_PX, bound.height),
        ]);
        const gridForm = form.strokeOnly(Palette.GRID.hex, 2);
        rowLines.map((line) => gridForm.line(line));
        colLines.map((line) => gridForm.line(line));
    };
}

function getDrawWorldFn(
    world: World,
    form: CanvasForm,
    selectedObjectRef: React.MutableRefObject<GameObject | undefined>,
): AnimateCallbackFn {
    const tempo = new Tempo(60);
    let timePercent = 0;
    tempo.every(1).progress((_, t) => {
        timePercent = 0.3 + 0.7 * Num.cycle(t);
    }, timePercent);
    return function (time, ftime) {
        const tiles = world.getAll(TileClass);
        tempo.animate(time, ftime);
        for (const tile of tiles) {
            if (tile === selectedObjectRef.current) {
                drawTile(tile, form, timePercent);
            } else {
                drawTile(tile, form);
            }
        }
        for (const property of world.getAll(PropertyClass)) {
            // draw property
            if (property === selectedObjectRef.current) {
                drawProperty(property, form, timePercent);
            } else {
                drawProperty(property, form);
            }
        }
        // draw start flag
        for (const tile of tiles) {
            if (tile.start) {
                drawStartFlag(tile, form);
            }
        }
        // draw arrows
        for (const tile of tiles) {
            if (tile.path) {
                for (const nextRef of tile.path.next) {
                    const nextTile = nextRef();
                    if (nextTile) {
                        arrowBetweenTiles(tile, nextTile, form);
                    } else {
                        log.severe(
                            `tile at (${tile.position.row}, ${tile.position.col}) has a missing ref for next`,
                        );
                    }
                }
            }
        }
    };
}

function alpha(color: Color, alpha: number) {
    const newColor = new Color(color);
    newColor.alpha = alpha;
    return newColor;
}
function drawStartFlag(tile: Tile2, form: CanvasForm) {
    form.fillOnly(Palette.START.hex)
        .font(24)
        .alignText('center', 'middle')
        .textBox(getTileRect(tile), 'S', 'center');
}

function getTileRect(tile: Tile2): Group {
    return Rectangle.from(
        new Pt(tile.position.col * TILE_SIZE_PX, tile.position.row * TILE_SIZE_PX),
        TILE_SIZE_PX,
        TILE_SIZE_PX,
    );
}
function drawTile(tile: Tile2, form: CanvasForm, selectedVaryingOpacity: number = 1) {
    const tileRect = Rectangle.from(
        new Pt(tile.position.col * TILE_SIZE_PX + 1, tile.position.row * TILE_SIZE_PX + 1),
        TILE_SIZE_PX - 2,
        TILE_SIZE_PX - 2,
    );
    if (tile.path) {
        form.fillOnly(
            selectedVaryingOpacity === 1
                ? Palette.ROAD.hex
                : alpha(Palette.ROAD, selectedVaryingOpacity).rgba,
        ).rect(tileRect);
    } else {
        form.fillOnly(
            selectedVaryingOpacity === 1
                ? Palette.EMPTY.hex
                : alpha(Palette.EMPTY, selectedVaryingOpacity).rgba,
        ).rect(tileRect);
    }
}
function drawProperty(property: Property2, form: CanvasForm, selectedVaryingOpacity: number = 1) {
    const propertyInset = 4;
    const propertyRect = Rectangle.from(
        new Pt(
            property.dimension.anchor.col * TILE_SIZE_PX + propertyInset,
            property.dimension.anchor.row * TILE_SIZE_PX + propertyInset,
        ),
        TILE_SIZE_PX - propertyInset * 2,
        TILE_SIZE_PX - propertyInset * 2,
    );
    form.strokeOnly(
        selectedVaryingOpacity === 1
            ? Palette.PROPERTY.hex
            : alpha(Palette.PROPERTY, selectedVaryingOpacity).rgba,
        2,
    ).rect(propertyRect);
}
function ptToCoordinate(pt: Pt): Coordinate {
    return { row: Math.floor(pt.y / TILE_SIZE_PX), col: Math.floor(pt.x / TILE_SIZE_PX) };
}
function getHandleDrawTileFn(world: World, tool: Tool | undefined, layer: LayerType): IPlayer {
    return {
        action(type, px, py, evt) {
            if (!tool) {
                return;
            }
            // when mouse leaves canvas while holding down button, it will still
            // be seen as holding down when coming back to canvas
            const isFakeMouseDragEvent = evt instanceof MouseEvent ? evt.buttons === 0 : false;
            const currentPt = new Pt(px, py);
            const touchCoor = ptToCoordinate(currentPt);
            if (type === 'down' && tool.onDown) {
                tool.onDown(touchCoor, currentPt, layer);
            }
            if ((type === 'down' || (type === 'drag' && !isFakeMouseDragEvent)) && tool.onDraw) {
                tool.onDraw(touchCoor, currentPt, layer);
            }
            if ((type === 'up' || type === 'drop') && tool.onUp) {
                tool.onUp(touchCoor, currentPt, layer);
            }
        },
    };
}
