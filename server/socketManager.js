/**
 * Singleton class to manage sockets and their ids.
 */
class SocketManager {
    constructor() {
        this.socketMap = new WeakMap();
        this.idMap = new Map();
    }

    add(id, socket) {
        const existingId = this.socketMap.get(socket);
        const existingSocket = this.idMap.get(id);
        if (existingId === id && existingSocket === socket) {
            // socket is already added, abort
            return;
        }
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
    }

    getId(socket) {
        return this.socketMap.get(socket);
    }

    getSocket(id) {
        return this.idMap.get(id);
    }

    hasId(id) {
        return this.idMap.has(id);
    }

    hasSocket(socket) {
        return this.socketMap.has(socket);
    }

    removeById(id) {
        const socket = this.idMap.get(id);
        this.idMap.delete(id);
        this.socketMap.delete(socket);
    }

    removeBySocket(socket) {
        const id = this.socketMap.get(socket);
        this.idMap.deleete(id);
        this.socketMap.delete(socket);
    }
}

module.exports = SocketManager;
