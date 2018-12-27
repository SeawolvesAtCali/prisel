import { handleLogin } from '../handleLogin';
import { Socket } from '../../objects';
import createContext from '../../createContext';

jest.mock('../../networkUtils');

describe('handleLogin', () => {
    it('should add the client to state', () => {
        const mockClient = {} as Socket;
        const mockContext = createContext();
        expect(Object.entries(mockContext.StateManager.connections).length).toBe(0);
        expect(mockContext.SocketManager.hasSocket(mockClient)).toBe(false);
        handleLogin(mockContext, mockClient)({ username: 'brandon' });
        expect(mockContext.SocketManager.hasSocket(mockClient));
        const id = mockContext.SocketManager.getId(mockClient);
        expect(mockContext.StateManager.connections[id].username).toBe('brandon');
    });
});
