import { StateManager } from './stateManager';
import SocketManager from '../socketManager';
import { wsServer } from './server';

export interface Context {
    SocketManager: SocketManager;
    StateManager: StateManager;
    server: wsServer;
    updateState: (
        updater: (draftState: StateManager, baseState: StateManager) => void,
    ) => StateManager;
}
