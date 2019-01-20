import { handleChat } from '../handleChat';
import createContext from '../../createContext';
import { broadcast } from '../../utils/networkUtils';
import { MessageType } from '@prisel/common';
import { GAME_PHASE } from '../../objects/gamePhase';
import { mockClient, mockSocket } from '../../utils/testUtils';

jest.mock('../../utils/networkUtils');

describe('handleChat', () => {
    it('should create correct broadcast message in a room', () => {
        const context = createContext({
            StateManager: {
                connections: {
                    user1: { id: 'user1', username: 'userA', roomId: 'Room-1' },
                },
                messages: [],
                rooms: {
                    'Room-1': {
                        id: 'Room-1',
                        name: 'roomA',
                        host: 'user1',
                        players: ['user1'],
                        gamePhase: GAME_PHASE.WAITING,
                    },
                },
            },
        });
        const socket = mockSocket();
        context.SocketManager.add('user1', socket);
        handleChat(context, socket)({
            message: 'testing',
        });

        expect(broadcast).toHaveBeenCalledWith(context, 'Room-1', MessageType.BROADCAST, {
            username: 'userA',
            message: 'testing',
        });
    });
});
