import { GameObject, World } from '@prisel/monopoly-common';
import React from 'react';
import { LayerType } from './Layer';
import { ToolType } from './tools/Tool';

export interface TempSelectingConfig {
    fieldId: string;
    layer: LayerType;
}

export interface AppContextInterface {
    tool: ToolType;
    layer: LayerType;
    width: number;
    height: number;
    world: World;
    tempSelectingConfig: TempSelectingConfig | undefined; // an unique id from component that request temp selecting
    setTempSelecting: (config: TempSelectingConfig | undefined) => void;
    selectedObject: GameObject | undefined;
    setSelectedObject: (selectedObject: GameObject | undefined) => unknown;
}
export const AppContext = React.createContext<AppContextInterface | undefined>(undefined);
