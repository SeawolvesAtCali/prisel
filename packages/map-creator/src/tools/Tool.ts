import { monopolypb } from '@prisel/protos';
import { Pt } from 'pts';
import { LayerType } from '../Layer';

export enum ToolType {
    SELECTOR = 'selector',
    ERASER = 'eraser',
    EMPTY_TILE_BRUSH = 'empty tile',
    PATH_TILE_BRUSH = 'path tile',
    PROPERTY = 'property',
}

export const toolSupportedLayer: Record<ToolType, LayerType[]> = {
    [ToolType.SELECTOR]: [LayerType.PROPERTY, LayerType.TILE],
    [ToolType.ERASER]: [LayerType.PROPERTY, LayerType.TILE],
    [ToolType.EMPTY_TILE_BRUSH]: [LayerType.TILE],
    [ToolType.PATH_TILE_BRUSH]: [LayerType.TILE],
    [ToolType.PROPERTY]: [LayerType.PROPERTY],
};

export interface Tool {
    /**
     * Called when mouse down or touch start on the canvas
     */
    onDown?: (coor: monopolypb.Coordinate, pt: Pt, layer: LayerType) => void;
    /**
     * Called when down and when drag. This is when tool should leave a mark on
     * the canvas.
     */
    onDraw?: (coor: monopolypb.Coordinate, pt: Pt, layer: LayerType) => void;
    /**
     * Called when mouse up, or touch stopped. This can only be detected while
     * inside canvas. If user drag from inside to outside, the up event will be
     * trigger when user come back to canvas.
     */
    onUp?: (coor: monopolypb.Coordinate, pt: Pt, layer: LayerType) => void;
}
