import { StateManager } from './stateManager';
import SocketManager from '../socketManager';
import { wsServer } from './server';
import { Handle } from '../utils/handle';
import { GameConfig } from '../utils/gameConfig';
import { RoomConfig } from '../utils/roomConfig';
import ConfigManager from '../utils/configManager';

export interface Context {
    SocketManager: SocketManager;
    StateManager: StateManager;
    server: wsServer;
    configManager?: ConfigManager;
    handles: {
        [roomId: string]: Handle;
    };
    updateState: (
        updater: (draftState: StateManager, baseState: StateManager) => void,
    ) => StateManager;
    getConfigs?: (
        gameType: string,
        roomType?: string,
    ) => { gameConfig: GameConfig; roomConfig: RoomConfig };
}
