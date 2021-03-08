import {
    BoardSetup,
    existOrThrow,
    MonopolyWorld,
    Property,
    Ref,
    Tile,
    World,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';

type Coordinate = monopolypb.Coordinate;

type CoordinateKey = string;
const toKey = (tile: Coordinate): CoordinateKey => `${tile.row}-${tile.col}`;

export function toBoardSetup(world: World, width: number, height: number): BoardSetup {
    const copiedWorld = new MonopolyWorld().populate(world.serialize());
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
    for (const tile of world.getAll(Tile)) {
        if (tile.prev.length > 0 || tile.next.length > 0) {
            pathTileIdMap.set(toKey(tile.position), world.makeRef(tile));
        }
    }

    for (const property of world.getAll(Property)) {
        if (
            existOrThrow(property.anchor, 'property.anchor not set') &&
            existOrThrow(property.size, 'property.size not set')
        ) {
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
        const pos = property.anchor;
        const walkablePosKey = toKey({ row: pos.row + dRow, col: pos.col + dCol });
        const tileObjectRef = pathTileIdMap.get(walkablePosKey);
        if (tileObjectRef) {
            const tileObject = tileObjectRef.get();
            if (tileObject) {
                const hasProperties = tileObject.hasProperties ?? [];
                tileObject.hasProperties = hasProperties;
                tileObject.hasProperties.push(world.makeRef(property));
            } else {
                throw new Error(
                    'Constructing property & tile association failed. No tileObject from ref',
                );
            }
        }
    }
}
