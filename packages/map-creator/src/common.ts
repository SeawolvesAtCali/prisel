import { monopolypb } from '@prisel/protos';
import * as React from 'react';

export enum Mode {
    UNSPECIFIED = 'none',
    BLANK = 'blank',
    ROAD = 'road',
    ERASE_ROAD = 'eraser',
    PROPERTY = 'property',
    START = 'start',
}
type Coordinate = monopolypb.Coordinate;
export const TILE_SIZE_PX = 50;
export const GAP_PX = 4;

export function equal(coor1: Coordinate, coor2: Coordinate): boolean {
    if (!coor1 || !coor2) {
        return false;
    }
    return coor1.row === coor2.row && coor1.col === coor2.col;
}

export function download(filename: string, text: string) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

export function useArrayRef<T>(length: number): React.MutableRefObject<Array<React.RefObject<T>>> {
    const refArray: Array<React.RefObject<T>> = React.useMemo(() => {
        return Array.from({ length }).map(() => React.createRef<T>());
    }, [length]);
    const ref = React.useRef(refArray);
    if (refArray !== ref.current) {
        ref.current = refArray;
    }
    return ref;
}
