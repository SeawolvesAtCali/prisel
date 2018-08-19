jest.mock('../updateUtils');
const roomController = require('../roomController');

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
                },
            };
            const mockSocketManager = {
                getSocket: () => ({ join: () => {} }),
            };
            roomController.addClientToRoom(
                { StateManager: mockStateManager, SocketManager: mockSocketManager },
                mockClientId,
                mockRoomId,
            );

            const mockClient = mockStateManager.connections.controllers[mockClientId];
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
        let mockStateManager;
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
            roomController.handleLeave(mockContext, {})();
            const controller = mockStateManager.connections.controllers[mockClientId];
            expect(controller.roomId).toBeUndefined();
            expect(controller.isReady).toBeUndefined();
        });

        it('should remove host', () => {
            const mockNextGuest = '789';
            mockStateManager.rooms = {
                [mockRoomId]: {
                    host: mockClientId,
                    guests: [mockNextGuest],
                },
            };
            roomController.handleLeave(mockContext, {})();
            const room = mockStateManager.rooms[mockRoomId];
            expect(room.host).not.toBe(mockClientId);
            expect(room.host).toBe(mockNextGuest);
            expect(room.guests.length).toBe(0);
        });

        it('should remove guest', () => {
            const mockHostId = '000';
            const mockOtherGuestId = '111';
            mockStateManager.rooms = {
                [mockRoomId]: {
                    host: mockHostId,
                    guests: [mockOtherGuestId, mockClientId],
                },
            };
            roomController.handleLeave(mockContext, {})();
            const room = mockStateManager.rooms[mockRoomId];
            expect(room.guests.length).toBe(1);
            expect(room.guests).not.toBe(expect.arrayContaining([mockClientId]));
            expect(room.host).toBe(mockHostId);
            expect(room.guests[0]).toBe(mockOtherGuestId);
        });
    });
});
