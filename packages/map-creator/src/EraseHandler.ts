import { DrawingModeHandler } from './DrawingModeHandler';
import { TileType } from '@prisel/monopoly-common';

export const EraseHandler: DrawingModeHandler = {
    onDraw: (row, col, currentMode, context) => {
        switch (currentMode) {
            case TileType.ROAD:
            // fall through
            case TileType.START:
                context.onClearArrow(row, col);
            // fall through
            case TileType.PROPERTY:
                context.setSelectedMode(TileType.UNSPECIFIED);
                break;
        }
    },
};
