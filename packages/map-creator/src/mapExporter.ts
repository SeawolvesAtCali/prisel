import {
    BoardSetup,
    Coordinate,
    existOrThrow,
    Mixins,
    Property,
    PropertyClass,
    Ref,
    Tile,
    TileClass,
    World,
} from '@prisel/monopoly-common';

type CoordinateKey = string;
const toKey = (tile: Coordinate): CoordinateKey => `${tile.row}-${tile.col}`;

export function toBoardSetup(world: World, width: number, height: number): BoardSetup {
    const copiedWorld = world.copy();
    connectPathAndProperties(copiedWorld);

    return {
        width,
        height,
        world: copiedWorld.serialize(),
    };
}

export function connectPathAndProperties(world: World) {
    const pathTileIdMap: Map<CoordinateKey, Ref<Tile>> = new Map();

    // store all pathTiles and properties in copiedWorld for easy referencing
    for (const tile of world.getAll(TileClass)) {
        if (Mixins.hasMixin(tile, Mixins.PathMixinConfig)) {
            pathTileIdMap.set(toKey(tile.position), world.getRef(tile));
        }
    }

    for (const property of world.getAll(PropertyClass)) {
        if (existOrThrow(property.dimension, 'property.dimension not set')) {
            // up
            addNeighborWalkable(property, -1, 0);
            // down
            addNeighborWalkable(property, 1, 0);
            // left
            addNeighborWalkable(property, 0, -1);
            // right
            addNeighborWalkable(property, 0, 1);
        }
    }

    // Populate road property mapping.
    // Run through all properties, see if there are road next to it, if there
    // is, create a mapping
    function addNeighborWalkable(property: Property, dRow: number, dCol: number): void {
        const pos = property.dimension.anchor;
        const walkablePosKey = toKey({ row: pos.row + dRow, col: pos.col + dCol });
        const tileObjectRef = pathTileIdMap.get(walkablePosKey);
        if (tileObjectRef) {
            const tileObject = tileObjectRef();
            if (tileObject) {
                const hasProperties = tileObject.hasProperties ?? [];
                tileObject.hasProperties = hasProperties;
                tileObject.hasProperties.push(world.getRef(property));
            } else {
                throw new Error(
                    'Constructing property & tile association failed. No tileObject from ref',
                );
            }
        }
    }
}
