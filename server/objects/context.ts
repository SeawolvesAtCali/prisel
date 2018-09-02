// <reference type="socket.io" />

import { StateManager } from './stateManager';
import SocketManager from '../socketManager';
import { Server } from 'socket.io';

export interface Context {
    SocketManager: SocketManager;
    StateManager: StateManager;
    io: Server;
}
