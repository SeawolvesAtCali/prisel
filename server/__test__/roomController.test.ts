import * as roomController from '../roomController';
import { Client } from '../objects';

jest.mock('../updateUtils');

describe('roomController', () => {
    describe('addClientToRoom', () => {
        it('should add to StateManager controllers list', () => {
            const mockClientId = '123';
            const mockRoomId = '456';
            const mockStateManager = {
                connections: {
                    controllers: {
                        [mockClientId]: {},
                    },
                    displays: {},
                },
            };
            const mockSocketManager = {
                getSocket: () => ({ join: () => {} }),
            };
            roomController.addClientToRoom(
                // @ts-ignore
                { StateManager: mockStateManager, SocketManager: mockSocketManager, io: null },
                mockClientId,
                mockRoomId,
            );

            // @ts-ignore
            const mockClient: Client = mockStateManager.connections.controllers[mockClientId];
            expect(mockClient.roomId).toBe(mockRoomId);
            expect(mockClient.isReady).toBe(false);
        });
    });

    describe('handleLeave', () => {
        const mockClientId = '123';
        const mockRoomId = '456';
        const mockSocketManager = {
            getId: () => mockClientId,
        };
        // @ts-ignore
        let mockStateManager;
        // @ts-ignore
        let mockContext;
        beforeEach(() => {
            mockStateManager = {
                connections: {
                    controllers: {
                        [mockClientId]: {
                            roomId: mockRoomId,
                            isReady: true,
                        },
                    },
                },
                rooms: {
                    [mockRoomId]: {
                        guests: [],
                    },
                },
            };
            mockContext = {
                StateManager: mockStateManager,
                SocketManager: mockSocketManager,
            };
        });
        it('should remove from controller list', () => {
            // @ts-ignore
            roomController.handleLeave(mockContext, {})();

            // @ts-ignore
            const controller = mockStateManager.connections.controllers[mockClientId];
            expect(controller.roomId).toBeUndefined();
            expect(controller.isReady).toBeUndefined();
        });

        it('should remove host', () => {
            const mockNextGuest = '789';
            // @ts-ignore
            mockStateManager.rooms = {
                [mockRoomId]: {
                    host: mockClientId,
                    guests: [mockNextGuest],
                },
            };
            // @ts-ignore
            roomController.handleLeave(mockContext, {})();
            // @ts-ignore
            const room = mockStateManager.rooms[mockRoomId];
            expect(room.host).not.toBe(mockClientId);
            expect(room.host).toBe(mockNextGuest);
            expect(room.guests.length).toBe(0);
        });

        it('should remove guest', () => {
            const mockHostId = '000';
            const mockOtherGuestId = '111';
            // @ts-ignore
            mockStateManager.rooms = {
                [mockRoomId]: {
                    host: mockHostId,
                    guests: [mockOtherGuestId, mockClientId],
                },
            };
            // @ts-ignore
            roomController.handleLeave(mockContext, {})();
            // @ts-ignore
            const room = mockStateManager.rooms[mockRoomId];
            expect(room.guests.length).toBe(1);
            expect(room.guests).not.toBe(expect.arrayContaining([mockClientId]));
            expect(room.host).toBe(mockHostId);
            expect(room.guests[0]).toBe(mockOtherGuestId);
        });
    });
});
