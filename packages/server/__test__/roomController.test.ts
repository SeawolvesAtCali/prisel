import * as roomController from '../handler/handleRoomActions';
import { Client, Context, Socket } from '../objects';
import createContext from '../createContext';
import { GAME_PHASE } from '../objects/gamePhase';

jest.mock('../utils/updateUtils');
jest.mock('../utils/networkUtils');

const createMockClient: (id: string, mockContext: Context) => { client: Client; socket: Socket } = (
    id,
    mockContext,
) => {
    const mockSocket = {} as Socket;
    mockContext.SocketManager.add(id, mockSocket);
    mockContext.updateState((draftState) => {
        draftState.connections[id] = {
            id,
            username: 'username',
        };
    });
    return { client: mockContext.StateManager.connections[id], socket: mockSocket };
};
describe('roomController', () => {
    describe('setClientRoomAttributes', () => {
        it('should add to StateManager connections list', () => {
            const mockClientId = '123';
            const mockRoomId = '456';
            const mockContext = createContext({});
            createMockClient(mockClientId, mockContext);

            roomController.setClientRoomAttributes(mockContext, mockClientId, mockRoomId);

            const mockClient: Client = mockContext.StateManager.connections[mockClientId];
            expect(mockClient.roomId).toBe(mockRoomId);
            expect(mockClient.isReady).toBe(false);
        });
    });

    describe('handleLeave', () => {
        const mockClientId = '123';
        const mockRoomId = '456';
        const mockGuestId = '789';

        let mockContext: Context;
        beforeEach(() => {
            mockContext = createContext();
            createMockClient(mockClientId, mockContext);
            createMockClient(mockGuestId, mockContext);

            mockContext.updateState((draftState) => {
                draftState.rooms[mockRoomId] = {
                    id: mockRoomId,
                    name: 'roomName',
                    host: mockClientId,
                    guests: [mockGuestId],
                    clients: [mockClientId, mockGuestId],
                    gamePhase: GAME_PHASE.WAITING,
                };
            });

            roomController.setClientRoomAttributes(mockContext, mockClientId, mockRoomId);
            roomController.setClientRoomAttributes(mockContext, mockGuestId, mockRoomId);
        });

        it('should remove from controller list', () => {
            roomController.handleLeave(
                mockContext,
                mockContext.SocketManager.getSocket(mockClientId),
            )({});

            const controller = mockContext.StateManager.connections[mockClientId];
            expect(controller.roomId).toBeUndefined();
            expect(controller.isReady).toBeUndefined();
        });

        it('should remove host', () => {
            roomController.handleLeave(
                mockContext,
                mockContext.SocketManager.getSocket(mockClientId),
            )({});
            const room = mockContext.StateManager.rooms[mockRoomId];
            expect(room.host).not.toBe(mockClientId);
            expect(room.host).toBe(mockGuestId);
            expect(room.guests.length).toBe(0);
        });

        it('should remove guest', () => {
            const mockOtherGuestId = '111';
            const { socket } = createMockClient(mockOtherGuestId, mockContext);

            mockContext.updateState((draftState) => {
                draftState.rooms[mockRoomId].guests.push(mockOtherGuestId);
            });

            roomController.setClientRoomAttributes(mockContext, mockOtherGuestId, mockRoomId);

            roomController.handleLeave(
                mockContext,
                mockContext.SocketManager.getSocket(mockGuestId),
            )({});

            const room = mockContext.StateManager.rooms[mockRoomId];
            expect(room.guests.length).toBe(1);
            expect(room.guests).not.toBe(expect.arrayContaining([mockClientId]));
            expect(room.host).toBe(mockClientId);
            expect(room.guests[0]).toBe(mockOtherGuestId);
        });
    });
});
