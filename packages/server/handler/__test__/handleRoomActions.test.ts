import * as roomHandler from '../handleRoomActions';
import createContext from '../../createContext';
import { Socket, ClientType } from '../../objects';

describe('handleRoomActions', () => {
    it('should set room-attributes of client', () => {
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
        roomHandler.setClientRoomAttributes(mockContext, 'user1', 'Room-1');

        expect(mockContext.StateManager.connections.user1.isReady).toEqual(false);
        expect(mockContext.StateManager.connections.user1.roomId).toEqual('Room-1');
    });
});
