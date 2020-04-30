import { DrawingModeHandler } from './DrawingModeHandler';
import { TileType } from '@prisel/monopoly';

export const DrawStartHandler: DrawingModeHandler = {
    onDraw: (row, col, currentMode, context) => {
        switch (currentMode) {
            case TileType.ROAD:
                // only road can be converted into start
                context.setSelectedMode(TileType.START);
        }
    },
};
