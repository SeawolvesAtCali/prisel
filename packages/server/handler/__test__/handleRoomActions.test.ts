import * as roomHandler from '../handleRoomActions';
import createContext from '../../createContext';
import { Socket, Context } from '../../objects';
import { closeSocket } from '../../networkUtils';

jest.mock('../../networkUtils');

const contextWithOneUserInRoom: Partial<Context> = Object.freeze({
    StateManager: {
        connections: {
            user1: { id: 'user1', username: 'userA' },
        },
        messages: [],
        rooms: { 'Room-1': { id: 'Room-1', name: 'roomA', host: 'user1', guests: [] } },
    },
});

describe('handleRoomActions', () => {
    it('should set room-attributes of client', () => {
        const mockContext = createContext(contextWithOneUserInRoom);
        roomHandler.setClientRoomAttributes(mockContext, 'user1', 'Room-1');

        const newUserState = mockContext.StateManager.connections.user1;
        expect(newUserState.isReady).toEqual(false);
        expect(newUserState.roomId).toEqual('Room-1');
    });

    describe('handleExit', () => {
        it('should remove the socket from SocketManager', () => {
            const mockSocket = {} as Socket;
            const mockContext = createContext(contextWithOneUserInRoom);
            const { SocketManager } = mockContext;
            SocketManager.add('user1', mockSocket);
            expect(SocketManager.hasSocket(mockSocket)).toBe(true);
            roomHandler.handleExit(mockContext, mockSocket)({});
            expect(SocketManager.hasSocket(mockSocket)).toBe(false);
        });

        it('should close the connection', () => {
            const mockSocket = {} as Socket;
            const mockContext = createContext(contextWithOneUserInRoom);
            const { SocketManager } = mockContext;
            SocketManager.add('user1', mockSocket);
            roomHandler.handleExit(mockContext, mockSocket)({});
            expect(closeSocket).toHaveBeenCalledWith(mockSocket);
        });
    });

    describe('handleCreateRoom', () => {
        it('should create a room and add user as host', () => {
            const mockSocket = {} as Socket;
            const mockUserId = 'user1';
            const mockContext = createContext({
                StateManager: {
                    connections: {
                        [mockUserId]: { id: mockUserId, username: 'userA' },
                    },
                    messages: [],
                    rooms: {},
                },
            });
            mockContext.SocketManager.add(mockUserId, mockSocket);
            const mockRoomName = 'LivingRoom';
            roomHandler.handleCreateRoom(mockContext, mockSocket)({ roomName: mockRoomName });
            const { roomId } = mockContext.StateManager.connections.user1;
            expect(roomId).toBeDefined();
            expect(mockContext.StateManager.rooms[roomId].host).toBe(mockUserId);
        });
    });

    describe('handleJoin', () => {
        it('should add user to the room', () => {
            const mockGuest = {} as Socket;
            const mockRoomId = 'room_1';
            const mockContext = createContext({
                StateManager: {
                    connections: {
                        host1: { id: 'host1', username: 'hostA', roomId: 'room_1' },
                        guest1: { id: 'guest1', username: 'guestA' },
                    },
                    messages: [],
                    rooms: {
                        [mockRoomId]: {
                            id: mockRoomId,
                            name: 'bathroom',
                            host: 'host1',
                            guests: [],
                        },
                    },
                },
            });
            mockContext.SocketManager.add('guest1', mockGuest);
            roomHandler.handleJoin(mockContext, mockGuest)({ roomId: mockRoomId });
            expect(mockContext.StateManager.connections.guest1.roomId).toBe(mockRoomId);
            expect(mockContext.StateManager.rooms[mockRoomId].guests).toEqual(['guest1']);
        });
        it('should not join another room if client is already in one room', () => {
            const mockHost = {} as Socket;
            const mockGuest = {} as Socket;
            const mockRoomId = 'room_1';
            const mockOtherRoomId = 'room_2';
            const mockContext = createContext({
                StateManager: {
                    connections: {
                        host1: { id: 'host1', username: 'hostA', roomId: mockRoomId },
                        guest1: { id: 'guest1', username: 'guestA', roomId: mockRoomId },
                    },
                    messages: [],
                    rooms: {
                        [mockRoomId]: {
                            id: mockRoomId,
                            name: 'bathroom',
                            host: 'host1',
                            guests: ['guest1'],
                        },
                        [mockOtherRoomId]: {
                            id: mockOtherRoomId,
                            name: 'kitchen',
                            host: 'anotherhost',
                            guests: [],
                        },
                    },
                },
            });
            const { SocketManager } = mockContext;
            SocketManager.add('host1', mockHost);
            SocketManager.add('guest1', mockGuest);

            roomHandler.handleJoin(mockContext, mockHost)({ roomId: mockOtherRoomId });
            roomHandler.handleJoin(mockContext, mockGuest)({ roomId: mockOtherRoomId });
            const { connections, rooms } = mockContext.StateManager;
            expect(connections.host1.roomId).toBe(mockRoomId);
            expect(rooms[mockRoomId].host).toBe('host1');

            expect(connections.guest1.roomId).toBe(mockRoomId);
            expect(rooms[mockRoomId].guests).toEqual(['guest1']);
            expect(rooms[mockOtherRoomId].host).toBe('anotherhost');
            expect(rooms[mockOtherRoomId].guests).toEqual([]);
        });
    });
});
