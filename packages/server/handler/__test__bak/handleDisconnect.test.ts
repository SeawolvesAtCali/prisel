// import { handleDisconnect } from '../handleDisconnect';
// import { Socket } from '../../objects';
// import createContext from '../../createContext';

// jest.mock('../../utils/networkUtils');

// describe('handleDisconnect', () => {
//     it('should remove the client from socket and state', () => {
//         const mockClient = {} as Socket;
//         const mockContext = createContext({
//             StateManager: {
//                 connections: {
//                     client1: {
//                         id: 'client1',
//                         username: 'user',
//                     },
//                 },
//                 messages: [],
//                 rooms: {},
//             },
//         });
//         mockContext.SocketManager.add('client1', mockClient);
//         expect(mockContext.StateManager.connections.client1).toBeDefined();
//         expect(mockContext.SocketManager.hasSocket(mockClient)).toBe(true);
//         handleDisconnect(mockContext, mockClient)({});
//         expect(mockContext.StateManager.connections.client1).toBeUndefined();
//         expect(mockContext.SocketManager.hasSocket(mockClient)).toBe(false);
//     });
// });
