import { handleGameStart } from '../handleGameStart';
import { Socket, Context } from '../../objects';
import createContext from '../../createContext';
import { mockSocket, mockRoomConfig, mockGameConfig } from '../../utils/testUtils';
import { GAME_PHASE } from '../../objects/gamePhase';
import Handle from '../../utils/handle';
import { GameConfig } from '../../utils/gameConfig';
import { BaseRoomConfig } from '../../utils/roomConfig';
import { getHandle } from '../../utils/stateUtils';

jest.mock('../../utils/networkUtils');

describe('handleGameStart', () => {
    let gameConfig: GameConfig;
    let context: Context;
    let socket: Socket;
    let handle: Handle;

    beforeEach(() => {
        socket = mockSocket();
        gameConfig = mockGameConfig({
            canStart: jest.fn(),
            onStart: jest.fn(),
        });
        context = createContext({
            StateManager: {
                connections: {
                    client1: {
                        id: 'client1',
                        username: 'user',
                        roomId: 'room_1',
                    },
                },
                messages: [],
                rooms: {
                    room_1: {
                        id: 'room_1',
                        name: 'room_name',
                        host: 'client1',
                        players: ['client1'],
                        gamePhase: GAME_PHASE.WAITING,
                    },
                },
            },
        });
        context.SocketManager.add('client1', socket);
        handle = new Handle({
            context,
            roomId: 'room_1',
            gameConfig,
            roomConfig: BaseRoomConfig,
        });
        context.handles.room_1 = handle;
    });
    it('should call canStart and onStart', () => {
        handle.setState({
            gamePhase: GAME_PHASE.WAITING,
        });
        (gameConfig.canStart as jest.Mock).mockReturnValue(true);
        handleGameStart(context, socket)({});

        expect(gameConfig.canStart).toHaveBeenCalled();
        expect(gameConfig.onStart).toHaveBeenCalled();
    });
    it('should set game phase to GAME when successfully start game', () => {
        handle.__dangerouslyUpdateRoom__((room) => {
            room.gamePhase = GAME_PHASE.WAITING;
        });
        (gameConfig.canStart as jest.Mock).mockReturnValue(true);

        handleGameStart(context, socket)({});

        expect(handle.gamePhase).toBe(GAME_PHASE.GAME);
    });
    it('should not start if game phase is not waiting', () => {
        handle.__dangerouslyUpdateRoom__((room) => {
            room.gamePhase = GAME_PHASE.GAME;
        });
        (gameConfig.canStart as jest.Mock).mockReturnValue(true);

        handleGameStart(context, socket)({});
        expect(gameConfig.onStart).not.toHaveBeenCalled();
    });
    it('should not start when canStart returns false', () => {
        handle.__dangerouslyUpdateRoom__((room) => {
            room.gamePhase = GAME_PHASE.GAME;
        });
        (gameConfig.canStart as jest.Mock).mockReturnValue(false);
        handleGameStart(context, socket)({});
        expect(gameConfig.onStart).not.toHaveBeenCalled();
    });
});
