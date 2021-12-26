import { newRequestManager } from '@prisel/common';
import { Context } from './objects';
import { ContextWithPartialConfig } from './objects/context';
import SocketManager from './socketManager';
import { BaseGameConfig } from './utils/gameConfig';
import { BaseRoomConfig } from './utils/roomConfig';

const createContext = (partial: Partial<ContextWithPartialConfig> = {}): Context => {
    const gameConfig = partial.gameConfig
        ? { ...BaseGameConfig, ...partial.gameConfig }
        : BaseGameConfig;
    const roomConfig = partial.roomConfig
        ? { ...BaseRoomConfig, ...partial.roomConfig }
        : BaseRoomConfig;
    const requestManager = newRequestManager();
    const context: Partial<Context> = {
        SocketManager: new SocketManager(),
        server: undefined,
        rooms: new Map(),
        players: new Map(),

        requests: requestManager,
        newRequestId: () => {
            return requestManager.newId();
        },
        // allow passed in partial to override everything
        ...partial,
        // gameConfig and roomConfig went through additional processing so
        // should not be overriden by partial
        gameConfig,
        roomConfig,
    };

    return context as Context;
};

export default createContext;
