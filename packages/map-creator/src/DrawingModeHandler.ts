import { TileType } from '@prisel/monopoly-common';
import * as React from 'react';

export interface DrawingModeContext {
    setSelectedMode: React.Dispatch<React.SetStateAction<TileType>>;
    onStartPair: (row: number, col: number) => void;
    onConnectPair: (row: number, col: number) => void;
    onClearArrow: (row: number, col: number) => void;
}

export interface DrawingModeHandler {
    onDraw(row: number, col: number, selected: TileType, context: DrawingModeContext): void;
    disableMouseOver?: boolean;
}
