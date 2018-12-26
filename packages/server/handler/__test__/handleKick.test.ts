import createContext from '../../createContext';
import { Socket } from '../../objects';
import { handleKick } from '../handleRoomActions';

jest.mock('../../networkUtils');

describe('handleKick', () => {
    it('should kick', () => {
        const mockHost = {} as Socket;
        const mockClient = {} as Socket;
        const mockContext = createContext({
            StateManager: {
                connections: {
                    host: {
                        id: 'host',
                        username: 'host',
                        roomId: 'room1',
                    },
                    client: {
                        id: 'client',
                        username: 'client',
                        roomId: 'room1',
                    },
                },
                messages: [],
                rooms: {
                    room1: {
                        id: 'room1',
                        name: 'room',
                        host: 'host',
                        guests: ['client'],
                    },
                },
            },
        });
        mockContext.SocketManager.add('host', mockHost);
        mockContext.SocketManager.add('client', mockClient);
        handleKick(mockContext, mockHost)({ userId: 'client' });
        const { connections, rooms } = mockContext.StateManager;
        expect(connections.client.roomId).toBeUndefined();
        expect(rooms.room1.guests).toEqual([]);
    });
    it('should not kick oneself', () => {
        const mockHost = {} as Socket;
        const mockContext = createContext({
            StateManager: {
                connections: {
                    host: {
                        id: 'host',
                        username: 'host',
                        roomId: 'room1',
                    },
                },
                messages: [],
                rooms: {
                    room1: {
                        id: 'room1',
                        name: 'room',
                        host: 'host',
                        guests: [],
                    },
                },
            },
        });
        mockContext.SocketManager.add('host', mockHost);
        const originalState = mockContext.StateManager;
        handleKick(mockContext, mockHost)({ userId: 'host' });
        expect(mockContext.StateManager).toBe(originalState);
    });

    it('should not kick one from another room', () => {
        const mockHost = {} as Socket;
        const mockGuest = {} as Socket;
        const mockContext = createContext({
            StateManager: {
                connections: {
                    host: {
                        id: 'host',
                        username: 'host',
                        roomId: 'room1',
                    },
                    guest: {
                        id: 'guest',
                        username: 'guest',
                        roomId: 'room2',
                    },
                },
                messages: [],
                rooms: {
                    room1: {
                        id: 'room1',
                        name: 'room',
                        host: 'host',
                        guests: [],
                    },
                    room2: {
                        id: 'room2',
                        name: 'room',
                        host: 'host2',
                        guests: ['guest'],
                    },
                },
            },
        });
        mockContext.SocketManager.add('host', mockHost);
        mockContext.SocketManager.add('guest', mockGuest);
        const originalState = mockContext.StateManager;
        handleKick(mockContext, mockHost)({ userId: 'guest' });
        expect(mockContext.StateManager).toBe(originalState);
    });
    it('should not kick if not host', () => {
        const mockHost = {} as Socket;
        const mockClient = {} as Socket;
        const mockClient2 = {} as Socket;
        const mockContext = createContext({
            StateManager: {
                connections: {
                    host: {
                        id: 'host',
                        username: 'host',
                        roomId: 'room1',
                    },
                    client: {
                        id: 'client',
                        username: 'client',
                        roomId: 'room1',
                    },
                    client2: {
                        id: 'client2',
                        username: 'client',
                        roomId: 'room1',
                    },
                },
                messages: [],
                rooms: {
                    room1: {
                        id: 'room1',
                        name: 'room',
                        host: 'host',
                        guests: ['client', 'client2'],
                    },
                },
            },
        });
        mockContext.SocketManager.add('host', mockHost);
        mockContext.SocketManager.add('client', mockClient);
        mockContext.SocketManager.add('client2', mockClient2);
        const originalState = mockContext.StateManager;
        handleKick(mockContext, mockClient)({ userId: 'client2' });
        expect(mockContext.StateManager).toBe(originalState);
    });
});
