import { BoardSetup, Coordinate, CoordinatePair } from '@prisel/monopoly-common';
import * as React from 'react';
import styles from './App.module.css';
import { Arrow } from './Arrow';
import { download, equal, Mode, useArrayRef } from './common';
import { toBoardSetup } from './mapExporter';
import { TileExport, TileView } from './TileView';

function range(start: number, end: number): number[] {
    const arr = [];
    for (let i = start; i < end; i++) {
        arr.push(i);
    }
    return arr;
}

export function canConnect(coor1: Coordinate, coor2: Coordinate): boolean {
    const dColAbs = Math.abs(coor1.col - coor2.col);
    const dRowAbs = Math.abs(coor1.row - coor2.row);
    return dColAbs + dRowAbs !== 0 && dColAbs <= 1 && dRowAbs <= 1;
}

interface BoardViewProps {
    mode: Mode;
    width: number;
    height: number;
}

interface ExportInterface {
    export: () => BoardSetup;
}

function isNotNullRef<T>(nullableRef: { current: T | null }): nullableRef is { current: T } {
    return nullableRef.current !== null;
}

export const BoardView = React.forwardRef<ExportInterface, BoardViewProps>((props, ref) => {
    const { mode, width, height } = props;
    const [drawing, setDrawing] = React.useState(false);
    const pairRef = React.useRef<Coordinate | null>(null);
    const [paths, setPaths] = React.useState<CoordinatePair[]>([]);
    const tileRefs = useArrayRef<TileExport>(height * width);
    const boardRef = React.useRef<HTMLDivElement | null>(null);

    const handleMouseDown = React.useCallback(() => {
        setDrawing(true);
    }, []);
    const handleMouseUp = React.useCallback(() => {
        setDrawing(false);
        pairRef.current = null;
    }, []);
    const handleMouseLeave = React.useCallback((e) => {
        setDrawing(false);
        pairRef.current = null;
    }, []);
    const handleStartPair = React.useCallback((row: number, col: number) => {
        pairRef.current = {
            row,
            col,
        };
    }, []);
    const handleConnectPair = React.useCallback((row: number, col: number) => {
        if (pairRef.current) {
            const newCoor: Coordinate = { row, col };
            const previousCoor = pairRef.current;
            setPaths((oldPathDirs) => {
                if (!canConnect(newCoor, previousCoor)) {
                    return oldPathDirs;
                }
                return oldPathDirs
                    .filter(
                        (oldPair) =>
                            !(
                                (equal(oldPair[0], previousCoor) && equal(oldPair[1], newCoor)) ||
                                // not allowing two way path
                                (equal(oldPair[1], previousCoor) && equal(oldPair[0], newCoor))
                            ),
                    )
                    .concat([[previousCoor, newCoor]]);
            });
        }
    }, []);
    const handleClear = React.useCallback((row: number, col: number) => {
        const currentCoor: Coordinate = { row, col };
        setPaths((oldPathDirs) =>
            oldPathDirs.filter(
                (oldPair) => !equal(oldPair[0], currentCoor) && !equal(oldPair[1], currentCoor),
            ),
        );
    }, []);

    React.useEffect(() => {
        setPaths((oldPathDirs) =>
            oldPathDirs.filter(
                (oldPair) =>
                    oldPair[0].row < height &&
                    oldPair[0].col < width &&
                    oldPair[1].row < height &&
                    oldPair[1].col < width,
            ),
        );
    }, [width, height]);

    React.useImperativeHandle(
        ref,
        () => {
            return {
                export: () =>
                    toBoardSetup(
                        tileRefs.current
                            .filter(isNotNullRef)
                            .map((tileRef) => tileRef.current.export()),
                        width,
                        height,
                        paths,
                    ),
            };
        },
        [paths, width, height, tileRefs],
    );

    return (
        <div
            ref={boardRef}
            className={styles.board}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDragStart={() => {
                return false;
            }}
            style={{
                gridTemplateRows: `repeat(${height}, 1fr)`,
                gridTemplateColumns: `repeat(${width}, 1fr)`,
            }}
        >
            {range(0, height).map((rowIndex) => (
                <React.Fragment key={rowIndex}>
                    {range(0, width).map((colIndex) => (
                        <TileView
                            key={`${rowIndex}-${colIndex}`}
                            row={rowIndex}
                            column={colIndex}
                            drawingMode={mode}
                            isMouseDown={drawing}
                            onStartPair={handleStartPair}
                            onConnectPair={handleConnectPair}
                            onClearArrow={handleClear}
                            ref={tileRefs.current[rowIndex * width + colIndex]}
                        />
                    ))}
                </React.Fragment>
            ))}
            <div className={styles.arrowContainer}>
                {paths.map((path) => (
                    <Arrow
                        path={path}
                        key={`(${path[0].row},${path[0].col})-(${path[1].row},${path[1].col})`}
                    />
                ))}
            </div>
        </div>
    );
});

export const Container: React.FC = () => {
    const [mode, setMode] = React.useState(Mode.ROAD);
    const boardRef = React.useRef<ExportInterface | null>(null);
    const [width, setWidth] = React.useState(10);
    const [height, setHeight] = React.useState(10);
    return (
        <div>
            <section>
                <label htmlFor="width-input">width</label>
                <input
                    id="width-input"
                    type="number"
                    value={width}
                    onChange={(e) => {
                        if (Number.parseInt(e.target.value, 10) > 0) {
                            setWidth(Number.parseInt(e.target.value, 10));
                        }
                    }}
                />
                <label htmlFor="height-input">height</label>
                <input
                    id="height-input"
                    type="number"
                    value={height}
                    onChange={(e) => {
                        if (Number.parseInt(e.target.value, 10) > 0) {
                            setHeight(Number.parseInt(e.target.value, 10));
                        }
                    }}
                />
                {Object.values(Mode).map((modeValue) => (
                    <React.Fragment key={modeValue}>
                        <input
                            type="radio"
                            id={`mode-selector-${modeValue}`}
                            name="drawing-mode"
                            value="none"
                            checked={mode === modeValue}
                            onChange={() => {
                                setMode(modeValue);
                            }}
                        />
                        <label htmlFor={`mode-selector-${modeValue}`}>{modeValue}</label>
                    </React.Fragment>
                ))}
                <button
                    onClick={() => {
                        if (isNotNullRef(boardRef)) {
                            download('map-export.json', JSON.stringify(boardRef.current.export()));
                        }
                    }}
                >
                    Export
                </button>
            </section>
            <section>
                <BoardView mode={mode} ref={boardRef} width={width} height={height} />
            </section>
        </div>
    );
};
