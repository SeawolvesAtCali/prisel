import { GameObject, World } from '@prisel/monopoly-common';
import React from 'react';
import { LayerType } from './Layer';
import { ToolType } from './tools/Tool';

export interface AppContextInterface {
    tool: ToolType;
    layer: LayerType;
    width: number;
    height: number;
    world: World;
    selectedObject?: GameObject;
    setSelectedObject: (selectedObject: GameObject | undefined) => unknown;
}
export const AppContext = React.createContext<AppContextInterface | undefined>(undefined);
