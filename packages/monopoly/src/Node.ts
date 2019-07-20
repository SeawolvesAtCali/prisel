import GameObject from './GameObject';
import Property from './Property';
import { Handle } from '@prisel/server';

interface NodeProps {
    id: string;
    next?: Node;
    prev?: Node;
    property?: Property;
}

export default interface Node extends NodeProps {
    genPath(steps: number): Node[];
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
}

export function create(props: NodeProps, handle: Handle): Node {
    const node = new NodeImpl(props);
    node.setHandle(handle);
    return node;
}
