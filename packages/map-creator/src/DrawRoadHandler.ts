import { DrawingModeHandler } from './DrawingModeHandler';
import { TileType } from '@prisel/monopoly';

export const DrawRoadHandler: DrawingModeHandler = {
    onDraw: (row, col, currentMode, context) => {
        switch (currentMode) {
            case TileType.UNSPECIFIED:
            // fall through
            case TileType.PROPERTY:
            // fall through
            case TileType.START:
                context.setSelectedMode(TileType.ROAD);
            // fall through
            case TileType.ROAD:
                context.onConnectPair(row, col);
                context.onStartPair(row, col);
                break;
        }
    },
};
