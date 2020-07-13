import {
    BoardSetup,
    Coordinate,
    CoordinatePair,
    exist,
    existOrThrow,
    isPropertyTile,
    isStartTile,
    isWalkable,
    PathNode,
    Property,
    Ref,
    Tile,
    World,
} from '@prisel/monopoly-common';

const toKey = (tile: Coordinate) => `${tile.row}-${tile.col}`;

// mutating tiles
export function toBoardSetup(
    tiles: Tile[],
    width: number,
    height: number,
    paths: CoordinatePair[],
): BoardSetup {
    const tileIdMap: Map<string, Ref<PathNode>> = new Map();
    const propertyIdMap: Map<string, Ref<Property>> = new Map();
    const world = new World();
    world.registerObject(PathNode).registerObject(Property);

    for (const tile of tiles) {
        const tilePosKey = toKey(tile.pos);
        // create GameObjects
        const tileObject = world.create(PathNode);
        tileIdMap.set(tilePosKey, world.getRef(PathNode, tileObject));

        tileObject.position = tile.pos;
        if (isWalkable(tile)) {
            tileObject.path = {
                next: [],
                prev: [],
            };
        }
        if (isStartTile(tile)) {
            tileObject.start = {};
        }
        if (isPropertyTile(tile)) {
            const propertyObject = world.create(Property);
            propertyIdMap.set(tilePosKey, world.getRef(Property, propertyObject));
            propertyObject.name = 'generic property';
            propertyObject.dimension = {
                anchor: tile.pos,
                size: { height: 1, width: 1 },
            };
            const defaultCost = 100;
            const defaultRent = 10;
            propertyObject.propertyLevel = {
                current: -1,
                levels: [
                    {
                        cost: defaultCost,
                        rent: defaultRent,
                    },
                    {
                        cost: defaultCost / 2,
                        rent: defaultRent * 5,
                    },
                    {
                        cost: defaultCost / 2,
                        rent: defaultRent * 10,
                    },
                ],
            };
        }
    }

    // go through paths and add the connections
    for (const path of paths) {
        const { 0: fromCoor, 1: toCoor } = path;
        const fromTileObjectRef = tileIdMap.get(toKey(fromCoor)) ?? null;
        const toTileObjectRef = tileIdMap.get(toKey(toCoor)) ?? null;
        if (exist(fromTileObjectRef) && exist(toTileObjectRef)) {
            fromTileObjectRef()?.path?.next?.push(toTileObjectRef);
            toTileObjectRef()?.path?.prev?.push(fromTileObjectRef);
        } else {
            throw new Error(`cannot get fromTileObjectRef or toTileObjectRef`);
        }
    }

    // Populate road property mapping.
    // Run through all properties, see if there are road next to it, if there
    // is, create a mapping
    function addNeighborWalkable(pos: Coordinate, dRow: number, dCol: number): void {
        const walkablePosKey = toKey({ row: pos.row + dRow, col: pos.col + dCol });
        const propertyPosKey = toKey(pos);
        const tileObjectRef = tileIdMap.get(walkablePosKey);
        const propertyObjectRef = propertyIdMap.get(propertyPosKey);
        if (tileObjectRef && propertyObjectRef) {
            const tileObject = tileObjectRef();
            if (tileObject) {
                const hasProperties = tileObject.hasProperties ?? [];
                tileObject.hasProperties = hasProperties;
                tileObject.hasProperties.push(propertyObjectRef);
            } else {
                throw new Error(
                    'Constructing property & tile association failed. No tileObject from ref',
                );
            }
        }
    }
    for (const property of world.getAll(Property) ?? []) {
        if (existOrThrow(property.dimension, 'property.dimension not set')) {
            // up
            addNeighborWalkable(property.dimension.anchor, -1, 0);
            // down
            addNeighborWalkable(property.dimension.anchor, 1, 0);
            // left
            addNeighborWalkable(property.dimension.anchor, 0, -1);
            // right
            addNeighborWalkable(property.dimension.anchor, 0, 1);
        }
    }

    for (const tile of world.getAll(PathNode) ?? []) {
        if (!tile.check()) {
            throw new Error('tile missing required mixin');
        }
    }

    for (const property of world.getAll(Property) ?? []) {
        if (!property.check()) {
            throw new Error('property missing required mixin');
        }
    }

    return {
        width,
        height,
        world: world.serialize(),
    };
}
