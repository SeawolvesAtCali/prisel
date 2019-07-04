import { mockSocket, mockRoomConfig, mockContext, mockGameConfig } from '../../utils/testUtils';
import { GAME_PHASE } from '../../objects/gamePhase';
import createHandle, { Handle } from '../../utils/handle';
import { handleExit } from '../handleExit';
import { closeSocket } from '../../utils/networkUtils';

jest.mock('../../utils/networkUtils');
jest.mock('../../utils/handle');

describe('handleExit', () => {
    it('should remove client', () => {
        const client = mockSocket();
        const mockRoomId = 'room_1';
        const roomConfig = mockRoomConfig({
            onLeave: jest.fn(),
        });
        const context = mockContext(
            {
                StateManager: {
                    connections: {
                        client1: { id: 'client1', username: 'clientName', roomId: 'room_1' },
                    },
                    messages: [],
                    rooms: {
                        [mockRoomId]: {
                            id: mockRoomId,
                            name: 'bathroom',
                            host: 'client1',
                            players: ['client1'],
                            gamePhase: GAME_PHASE.WAITING,
                        },
                    },
                },
            },
            undefined,
            roomConfig,
        );
        context.handles[mockRoomId] = createHandle({
            context,
            roomId: mockRoomId,
            roomConfig,
            gameConfig: mockGameConfig(),
        });
        context.SocketManager.add('client1', client);

        const data = {};
        handleExit(context, client)(data);
        expect(roomConfig.onLeave).toHaveBeenCalledWith(expect.any(Handle), 'client1', data);
    });

    it('should just remove client if client is not logged in yet', () => {
        const socket = mockSocket();
        const context = mockContext();
        handleExit(context, socket)({});
        expect(closeSocket).toHaveBeenCalled();
    });
});
