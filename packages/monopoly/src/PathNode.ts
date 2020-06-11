import GameObject, { FlatGameObject, Ref } from './GameObject';
import Property from './Property';
import { Tile, Walkable } from '@prisel/monopoly-common';
import { getRand } from './utils';

export interface FlatPathNode extends FlatGameObject {
    id: string;
    next: Array<Ref<PathNode>>;
    prev: Array<Ref<PathNode>>;
    properties: Array<Ref<Property>>;
}

interface Props {
    id: string;
    tile: Tile & Walkable;
    next?: PathNode[];
    prev?: PathNode[];
    properties?: Property[];
}

/**
 * A point on the path that players follow
 */
export default class PathNode extends GameObject {
    public id: string;
    public tile: Tile & Walkable;
    public next: PathNode[];
    public prev: PathNode[];
    public properties: Property[];

    constructor(props: Props) {
        super();
        const { id, tile, next, prev, properties } = props;
        this.tile = tile;
        this.id = id;
        this.next = next || [];
        this.prev = prev || [];
        this.properties = properties || [];
    }

    public addNext(pathNode: PathNode) {
        this.next.push(pathNode);
    }

    public addPrev(pathNode: PathNode) {
        this.prev.push(pathNode);
    }

    public addProperty(property: Property) {
        this.properties.push(property);
    }

    public genPath(steps: number) {
        const path: PathNode[] = [];
        let current: PathNode = this;
        for (let i = 0; i < steps; i++) {
            if (current.next.length > 0) {
                // Choose a random next
                current = getRand(current.next);
                path.push(current);
            } else {
                // the board is incorrectly defined because we cannot find the next node
                break;
            }
        }
        return path;
    }

    public flat(): FlatPathNode {
        return {
            id: this.id,
            prev: this.prev.map((prev) => this.ref(prev)),
            next: this.next.map((next) => this.ref(next)),
            properties: this.properties.map((property) => this.ref(property)),
        };
    }
}

export function create(props: Props): PathNode {
    return new PathNode(props);
}
