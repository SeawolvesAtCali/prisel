import * as React from 'react';
import { Mode } from './common';
import styles from './App.module.css';
import { Tile, TileType, RoadTile, PropertyTile, StartTile } from '@prisel/monopoly-common';
import { DrawingModeContext } from './DrawingModeHandler';
import { DrawPropertyHandler } from './DrawPropertyHandler';
import { DrawStartHandler } from './DrawStartHandler';
import { DrawRoadHandler } from './DrawRoadHandler';
import { EraseHandler } from './EraseHandler';

interface TileViewProps {
    drawingMode: Mode;
    isMouseDown: boolean;
    row: number;
    column: number;
    onStartPair: DrawingModeContext['onStartPair'];
    onConnectPair: DrawingModeContext['onConnectPair'];
    onClearArrow: DrawingModeContext['onClearArrow'];
}

const drawingModeHandlerMap = {
    [Mode.ERASE_ROAD]: EraseHandler,
    [Mode.ROAD]: DrawRoadHandler,
    [Mode.START]: DrawStartHandler,
    [Mode.PROPERTY]: DrawPropertyHandler,
};

function getTileClass(tileType: TileType): string {
    switch (tileType) {
        case TileType.ROAD:
            return styles.roadTile;
        case TileType.PROPERTY:
            return styles.propertyTile;
        case TileType.START:
            return styles.startTile;
        default:
            return '';
    }
}

export interface TileExport {
    export: () => Tile;
}

export const TileView = React.forwardRef<TileExport, TileViewProps>((props, ref) => {
    const {
        drawingMode,
        isMouseDown,
        onStartPair,
        onConnectPair,
        onClearArrow,
        row,
        column,
    } = props;
    const [selected, setSelected] = React.useState(TileType.UNSPECIFIED);

    const drawingModeContext = React.useMemo<DrawingModeContext>(
        () => ({
            setSelectedMode: setSelected,
            onStartPair,
            onConnectPair,
            onClearArrow,
        }),
        [onStartPair, onConnectPair, onClearArrow],
    );
    const handleMouseOver = React.useCallback(() => {
        if (drawingMode === Mode.UNSPECIFIED || !isMouseDown) {
            return;
        }
        if (drawingModeHandlerMap[drawingMode]) {
            const handler = drawingModeHandlerMap[drawingMode];
            if (handler.disableMouseOver) {
                return;
            }
            handler.onDraw(row, column, selected, drawingModeContext);
        }
    }, [drawingMode, isMouseDown, row, column, selected, drawingModeContext]);
    const handleMouseDown = React.useCallback(() => {
        if (drawingMode === Mode.UNSPECIFIED) {
            return;
        }
        if (drawingModeHandlerMap[drawingMode]) {
            const handler = drawingModeHandlerMap[drawingMode];
            handler.onDraw(row, column, selected, drawingModeContext);
        }
    }, [drawingMode, row, column, selected, drawingModeContext]);

    React.useImperativeHandle(
        ref,
        () => ({
            export: () => {
                switch (selected) {
                    case TileType.START:
                        const startTile: StartTile = {
                            type: TileType.START,
                            pos: { row, col: column },
                            // prev and next will be filled out by BoardView's export
                            next: [],
                            prev: [],
                        };
                        return startTile;
                    case TileType.ROAD:
                        const roadTile: RoadTile = {
                            type: TileType.ROAD,
                            pos: { row, col: column },
                            // prev and next will be filled out by BoardView's export
                            next: [],
                            prev: [],
                        };
                        return roadTile;
                    case TileType.PROPERTY:
                        const propertyTile: PropertyTile = {
                            type: TileType.PROPERTY,
                            pos: { row, col: column },
                            name: 'unnamed property',
                            price: 100,
                            rent: 10,
                        };
                        return propertyTile;
                    default:
                        return {
                            type: TileType.UNSPECIFIED,
                            pos: { row, col: column },
                        };
                }
            },
        }),
        [selected, row, column],
    );
    return (
        <div
            className={`${styles.tile} ${getTileClass(selected)}`}
            onMouseOver={handleMouseOver}
            onMouseDown={handleMouseDown}
        />
    );
});
