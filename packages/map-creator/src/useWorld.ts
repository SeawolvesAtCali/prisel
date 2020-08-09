import { PropertyClass, TileClass, World } from '@prisel/monopoly-common';
import React from 'react';

export function useWorld() {
    const world = React.useMemo(
        () => new World().registerObject(TileClass).registerObject(PropertyClass),
        [],
    );
    return world;
}
