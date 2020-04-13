import { DrawingModeHandler } from './DrawingModeHandler';
import { TileType } from '@prisel/monopoly';

export const DrawPropertyHandler: DrawingModeHandler = {
    onDraw: (row, col, currentMode, context) => {
        switch (currentMode) {
            case TileType.ROAD:
            // fall through
            case TileType.START:
                context.onClearArrow(row, col);
            // fall through
            case TileType.UNSPECIFIED:
                context.setSelectedMode(TileType.PROPERTY);
                break;
        }
    },
};
