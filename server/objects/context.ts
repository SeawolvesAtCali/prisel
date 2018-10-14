import { StateManager } from './stateManager';
import SocketManager from '../socketManager';
import { isContext } from 'vm';

export interface Context {
    SocketManager: SocketManager;
    StateManager: StateManager;
    io: SocketIO.Server;
    updateState: (updater: (draftState: StateManager, baseState: StateManager) => void) => void;
}
