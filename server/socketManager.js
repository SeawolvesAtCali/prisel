// @flow
import type { SocketT } from './objects';

const debug = require('debug')('debug');

/**
 * Singleton class to manage sockets and their ids.
 */
class SocketManager {
    socketMap: WeakMap<SocketT, string>;
    idMap: Map<string, SocketT>;

    constructor() {
        this.socketMap = new WeakMap();
        this.idMap = new Map();
    }

    add(id: string, socket: SocketT) {
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
        this.idMap.set(id, socket);
    }

    getId(socket: SocketT): string {
        const id = this.socketMap.get(socket);
        if (id === undefined) {
            throw new Error('got undefined socket id');
        }
        return id;
    }

    getSocket(id: string): SocketT {
        const socket = this.idMap.get(id);
        if (socket === undefined) {
            throw new Error(`got undefined socket for id ${id}`);
        }
        return socket;
    }

    hasId(id: string) {
        return this.idMap.has(id);
    }

    hasSocket(socket: SocketT) {
        return this.socketMap.has(socket);
    }

    removeById(id: string) {
        const socket: SocketT | void = this.idMap.get(id);
        this.idMap.delete(id);
        if (socket !== undefined) {
            this.socketMap.delete(socket);
        }
    }

    removeBySocket(socket: SocketT) {
        const id: string | void = this.socketMap.get(socket);
        if (id !== undefined) {
            this.idMap.delete(id);
        }
        this.socketMap.delete(socket);
    }
}

module.exports = SocketManager;
