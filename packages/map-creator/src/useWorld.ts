import { Property, Tile, World } from '@prisel/monopoly-common';
import React from 'react';
import { readFromStorage } from './browserStorage';

export function useWorld() {
    const world = React.useMemo(
        () => readFromStorage(new World().registerObject(Tile).registerObject(Property)),
        [],
    );
    return world;
}
