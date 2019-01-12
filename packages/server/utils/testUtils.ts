import { Socket, Client, Context } from '../objects';
import { RoomConfig } from './roomConfig';
import { GameConfig } from './gameConfig';
import createContext from '../createContext';

export function mockSocket() {
    return {} as Socket;
}

export function mockClient(partial?: Partial<Client>): Client {
    return {
        id: 'CLIENT-id',
        username: 'username',
        ...partial,
    };
}

const noop = () => {};
export function mockRoomConfig(partial?: Partial<RoomConfig>): RoomConfig {
    return {
        type: 'room',
        onCreate: noop,
        onGameStart: noop,
        onJoin: noop,
        onLeave: noop,
        onMessage: noop,
        ...partial,
    };
}

export function mockGameConfig(partial?: Partial<GameConfig>): GameConfig {
    return {
        type: 'game',
        maxPlayers: 10,
        init: noop,
        start: () => true,
        handleMessage: noop,
        addPlayer: noop,
        removePlayer: noop,
        end: noop,
        ...partial,
    };
}

export function mockContext(
    partial?: Partial<Context>,
    gameConfig?: GameConfig,
    roomConfig?: RoomConfig,
): Context {
    const game = gameConfig || mockGameConfig();
    const room = roomConfig || mockRoomConfig();
    return createContext({
        getConfigs: () => ({ gameConfig: game, roomConfig: room }),
        ...partial,
    });
}
