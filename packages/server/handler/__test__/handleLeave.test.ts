import createContext from '../../createContext';
import { Socket, Context } from '../../objects';
import { handleLeaveImpl } from '../handleRoomActions';

jest.mock('../../utils/networkUtils');

describe('handleLeave', () => {
    it('should does nothing if not in a room', () => {
        const mockClient = {} as Socket;
        const mockContext = createContext({
            StateManager: {
                connections: {
                    client: {
                        id: 'client',
                        username: 'jack',
                    },
                },
                messages: [],
                rooms: {},
            },
        });
        const originalState = mockContext.StateManager;
        mockContext.SocketManager.add('client', mockClient);
        expect(mockContext.StateManager).toBe(originalState);
    });

    it('should remove the client from guests if it is a guest', () => {
        const mockClient = {} as Socket;
        const mockRoomId = 'room1';
        const mockContext = createContext({
            StateManager: {
                connections: {
                    client1: {
                        id: 'client1',
                        username: '1',
                        roomId: mockRoomId,
                    },
                },
                messages: [],
                rooms: {
                    [mockRoomId]: {
                        id: mockRoomId,
                        name: 'big room',
                        host: 'host1',
                        guests: ['jack', 'jenny', 'client1', 'amy', 'ben'],
                    },
                },
            },
        });
        mockContext.SocketManager.add('client1', mockClient);
        handleLeaveImpl(mockContext, mockClient)({});
        const { guests } = mockContext.StateManager.rooms[mockRoomId];
        expect(guests).toHaveLength(4);
        expect(guests.includes('client1')).toBe(false);
    });

    it('should promote the first guest if host leave', () => {
        const mockClient = {} as Socket;
        const mockRoomId = 'room1';
        const mockContext = createContext({
            StateManager: {
                connections: {
                    client1: {
                        id: 'client1',
                        username: '1',
                        roomId: mockRoomId,
                        isReady: true,
                    },
                },
                messages: [],
                rooms: {
                    [mockRoomId]: {
                        id: mockRoomId,
                        name: 'big room',
                        host: 'client1',
                        guests: ['jack', 'jenny', 'amy', 'ben'],
                    },
                },
            },
        });
        mockContext.SocketManager.add('client1', mockClient);
        handleLeaveImpl(mockContext, mockClient)({});
        const { client1 } = mockContext.StateManager.connections;
        const room = mockContext.StateManager.rooms[mockRoomId];
        expect(client1.roomId).toBeUndefined();
        expect(client1.isReady).toBeUndefined();

        expect(room.host).toBe('jack');
        expect(room.guests).toEqual(['jenny', 'amy', 'ben']);
    });

    it('should remove the room if no one left in the room', () => {
        const mockClient = {} as Socket;
        const mockContext = createContext({
            StateManager: {
                connections: {
                    client1: {
                        id: 'client1',
                        username: 'client',
                        roomId: 'room1',
                    },
                },
                messages: [],
                rooms: {
                    room1: {
                        id: 'room1',
                        name: 'room',
                        host: 'client1',
                        guests: [],
                    },
                },
            },
        });
        mockContext.SocketManager.add('client1', mockClient);
        handleLeaveImpl(mockContext, mockClient)({});
        expect(mockContext.StateManager.rooms.room1).toBeUndefined();
    });
});
