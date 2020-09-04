import { PropertyClass, TileClass, World } from '@prisel/monopoly-common';
import React from 'react';
import { readFromStorage } from './browserStorage';

export function useWorld() {
    const world = React.useMemo(
        () => readFromStorage(new World().registerObject(TileClass).registerObject(PropertyClass)),
        [],
    );
    return world;
}
