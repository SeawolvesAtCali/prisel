import debug from './debug';
import { Socket } from './objects';

/**
 * Singleton class to manage sockets and their ids.
 */
class SocketManager {
    private socketMap: Map<Socket, string>;
    private idMap: Map<string, Socket>;

    constructor() {
        this.socketMap = new Map();
        this.idMap = new Map();
    }

    public size() {
        return this.idMap.size;
    }

    public getIds() {
        return this.idMap.keys();
    }

    public getSockets() {
        return this.idMap.values();
    }

    public add(id: string, socket: Socket) {
        const existingId = this.socketMap.get(socket);
        const existingSocket = this.idMap.get(id);
        if (existingId === id && existingSocket === socket) {
            // socket is already added, abort
            return;
        }
        // TODO if client login twice, this will break
        if (existingId) {
            throw new Error(
                `SocketMap inconsistency found. adding Id ${id} but found ${existingId}`,
            );
        }
        if (existingSocket) {
            throw new Error(
                `SocketMap inconsistency found. adding Id to ${id} but found another socket at this id`,
            );
        }
        this.socketMap.set(socket, id);
        this.idMap.set(id, socket);
    }

    public getId(socket: Socket): string | undefined {
        const id = this.socketMap.get(socket);
        return id;
    }

    public getSocket(id: string): Socket | undefined {
        const socket = this.idMap.get(id);
        return socket;
    }

    public hasId(id: string) {
        return this.idMap.has(id);
    }

    public hasSocket(socket: Socket) {
        return this.socketMap.has(socket);
    }

    public removeById(id: string) {
        const socket: Socket | void = this.idMap.get(id);
        this.idMap.delete(id);
        if (socket !== undefined) {
            this.socketMap.delete(socket);
        }
    }

    public removeBySocket(socket: Socket) {
        debug('removing socket');
        const id: string | void = this.socketMap.get(socket);
        if (id !== undefined) {
            this.idMap.delete(id);
        }
        this.socketMap.delete(socket);
    }
}

export default SocketManager;
