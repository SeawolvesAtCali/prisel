import { StateManager } from './stateManager';
import SocketManager from '../socketManager';
import { Server } from './server';

export interface Context {
    SocketManager: SocketManager;
    StateManager: StateManager;
    server: Server;
    updateState: (updater: (draftState: StateManager, baseState: StateManager) => void) => void;
}
