import { StateManager } from './stateManager';
import SocketManager from '../socketManager';

export interface Context {
    SocketManager: SocketManager;
    StateManager: StateManager;
    io: SocketIO.Server;
}
