import { handleChat } from '../handleChat';
import createContext from '../../createContext';
import { Socket, ClientType } from '../../objects';
import { broadcast } from '../../networkUtils';
import ChatType from '@monopoly/common/lib/message/chat';

jest.mock('../../networkUtils');

describe('handleChat', () => {
    it('should create correct broadcast message in a room', () => {
        const mockContext = createContext({
            StateManager: {
                connections: {
                    user1: { id: 'user1', username: 'userA', type: ClientType.Controller },
                },
                messages: [],
                rooms: { 'Room-1': { id: 'Room-1', name: 'roomA', host: 'user1', guests: [] } },
            },
        });
        const mockClient = {} as Socket;
        handleChat(mockContext, mockClient)({
            userId: 'user1',
            message: 'testing',
            roomId: 'Room-1',
        });

        expect(broadcast).toHaveBeenCalledWith(mockContext, 'Room-1', ChatType.BROADCAST, {
            username: 'userA',
            message: 'testing',
            roomId: 'Room-1',
        });
    });
});
