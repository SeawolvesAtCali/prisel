import GameObject, { IGameObject, FlatGameObject, Ref } from './GameObject';
import Property from './Property';
import { Handle } from '@prisel/server';

interface NodeProps extends IGameObject {
    id: string;
    next?: Node;
    prev?: Node;
    property?: Property;
}

export default interface Node extends NodeProps {
    genPath(steps: number): Node[];
}

interface FlatNodeProject extends FlatGameObject {
    next: Ref<Node>;
    prev: Ref<Node>;
    property: Ref<Property>;
}

class NodeImpl extends GameObject implements Node {
    public id: string;
    public next?: Node;
    public prev?: Node;
    public property?: Property;

    constructor(node: NodeProps) {
        super();
        this.id = node.id;
        this.next = node.next;
        this.prev = node.prev;
        this.property = node.property;
    }

    public genPath(steps: number) {
        const path: Node[] = [];
        let current: Node = this;
        for (let i = 0; i < steps; i++) {
            if (current.next) {
                current = current.next;
                path.push(current);
            } else {
                // the board is incorrectly defined because we cannot find the next node
                break;
            }
        }
        return path;
    }

    public flat(): FlatNodeProject {
        return {
            id: this.id,
            prev: this.ref(this.prev),
            next: this.ref(this.next),
            property: this.ref(this.property),
        };
    }
}

export function create(props: NodeProps, handle: Handle): Node {
    const node = new NodeImpl(props);
    node.setHandle(handle);
    return node;
}
