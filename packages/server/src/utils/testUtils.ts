import { Socket, Context } from '../objects';
import { RoomConfig } from './roomConfig';
import { GameConfig } from './gameConfig';
import createContext from '../createContext';

export function mockSocket() {
    return {} as Socket;
}

const noop = () => {};
export function mockRoomConfig(partial?: Partial<RoomConfig>): RoomConfig {
    return {
        type: 'room',
        onCreate: noop,
        onGameStart: noop,
        onJoin: noop,
        onLeave: noop,
        ...partial,
    };
}

export function mockGameConfig(partial?: Partial<GameConfig>): GameConfig {
    return {
        type: 'game',
        maxPlayers: 10,
        canStart: () => true,
        onStart: noop,
        onAddPlayer: noop,
        onRemovePlayer: noop,
        onEnd: noop,
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
        gameConfig: game,
        roomConfig: room,
        ...partial,
    });
}
