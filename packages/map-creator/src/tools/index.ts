import { World } from '@prisel/monopoly-common';
import { CanvasForm } from 'pts';
import { CanvasOps } from '../CanvasOps';
import { EmptyTileBrush } from './EmptyTileBrush';
import { Eraser } from './Eraser';
import { PathTileBrush } from './PathTileBrush';
import { PropertyBrush } from './PropertyBrush';
import { Selector } from './Selector';
import { Tool, ToolType } from './Tool';

interface ToolCreator {
    new (world: World, form: CanvasForm, ops: CanvasOps): Tool;
}
export const toolCreatorMap: Record<ToolType, ToolCreator> = {
    [ToolType.EMPTY_TILE_BRUSH]: EmptyTileBrush,
    [ToolType.PATH_TILE_BRUSH]: PathTileBrush,
    [ToolType.ERASER]: Eraser,
    [ToolType.SELECTOR]: Selector,
    [ToolType.PROPERTY]: PropertyBrush,
};
