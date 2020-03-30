import * as React from 'react';
import { Mode } from './common';
import styles from './App.css';
import { Tile, TileType, RoadTile, PropertyTile, StartTile } from '@prisel/monopoly';

interface TileViewProps {
    drawingMode: Mode;
    isMouseDown: boolean;
    row: number;
    column: number;
    onStartPair: (row: number, col: number) => void;
    onConnectPair: (row: number, col: number) => void;
    onClearArrow: (row: number, col: number) => void;
}

function getTileClass(drawingMode: Mode): string {
    switch (drawingMode) {
        case Mode.ROAD:
            return styles.roadTile;
        case Mode.PROPERTY:
            return styles.propertyTile;
        case Mode.START:
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
    const [selected, setSelected] = React.useState(Mode.UNSPECIFIED);
    const drawRoad = React.useCallback(() => {
        switch (selected) {
            case Mode.UNSPECIFIED:
            // fall through
            case Mode.PROPERTY:
            // fall through
            case Mode.START:
                setSelected(Mode.ROAD);
            // fall through
            case Mode.ROAD:
                onConnectPair(row, column);
                onStartPair(row, column);
                break;
        }
    }, [selected, onConnectPair, onStartPair, row, column]);
    const drawStart = React.useCallback(() => {
        switch (selected) {
            case Mode.ROAD:
                // only road can be converted into start
                setSelected(Mode.START);
        }
    }, [selected]);
    const erase = React.useCallback(() => {
        switch (selected) {
            case Mode.ROAD:
            // fall through
            case Mode.START:
                onClearArrow(row, column);
            // fall through
            case Mode.PROPERTY:
                setSelected(Mode.UNSPECIFIED);
                break;
        }
    }, [selected, onClearArrow, row, column]);
    const drawProperty = React.useCallback(() => {
        if (selected === Mode.UNSPECIFIED) {
            setSelected(Mode.PROPERTY);
        }
        if (selected === Mode.ROAD || selected === Mode.START) {
            setSelected(Mode.PROPERTY);
            onClearArrow(row, column);
        }
    }, [selected, onClearArrow, row, column]);
    const handleMouseOver = React.useCallback(() => {
        if (drawingMode === Mode.UNSPECIFIED || !isMouseDown) {
            return;
        }
        switch (drawingMode) {
            case Mode.ERASE_ROAD:
                erase();
                break;
            case Mode.ROAD:
                drawRoad();
                break;
            case Mode.PROPERTY:
                drawProperty();
                break;
        }
    }, [drawingMode, isMouseDown, erase, drawRoad, drawProperty]);
    const handleMouseDown = React.useCallback(() => {
        switch (drawingMode) {
            case Mode.ERASE_ROAD:
                erase();
                break;
            case Mode.ROAD:
                drawRoad();
                break;
            case Mode.PROPERTY:
                drawProperty();
                break;
            case Mode.START:
                drawStart();
                break;
        }
    }, [drawingMode, erase, drawRoad, drawProperty]);

    React.useImperativeHandle(
        ref,
        () => ({
            export: () => {
                switch (selected) {
                    case Mode.START:
                        const startTile: StartTile = {
                            type: TileType.START,
                            pos: { row, col: column },
                            // prev and next will be filled out by BoardView's export
                            next: [],
                            prev: [],
                        };
                        return startTile;
                    case Mode.ROAD:
                        const roadTile: RoadTile = {
                            type: TileType.ROAD,
                            pos: { row, col: column },
                            // prev and next will be filled out by BoardView's export
                            next: [],
                            prev: [],
                        };
                        return roadTile;
                    case Mode.PROPERTY:
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
