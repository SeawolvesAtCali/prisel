const handler = require('../controllerHandler');
const roomMessages = require('../message/room');

jest.mock('../networkUtils');

describe('controllerHandler', () => {
    describe('handleLogin', () => {
        let mockStateManager;
        let mockContext;
        let mockSocketManager;
        beforeEach(() => {
            mockStateManager = {
                connections: {
                    controllers: [],
                },
            };
            mockSocketManager = {
                add: jest.fn().mockName('SocketManager.add'),
            };
            mockContext = {
                StateManager: mockStateManager,
                SocketManager: mockSocketManager,
            };
        });

        it('should save the connection in StateManager', () => {
            handler.handleLogin(mockContext, {})({ username: 'Batman' });
            expect(
                Object.values(mockStateManager.connections.controllers).find(
                    (controller) => controller.username === 'Batman',
                ),
            ).toEqual(expect.any(Object));
        });

        it('should save the connection in SocketMap', () => {
            const mockClient = {};
            handler.handleLogin(mockContext, mockClient)();
            expect(mockSocketManager.add).toHaveBeenCalledWith(expect.any(String), mockClient);
        });
        it('should emit login accept message back to client', () => {
            roomMessages.getLoginAccept = jest.fn(() => []).mockName('getLoginAccept');
            handler.handleLogin(mockContext, {})({});
            expect(roomMessages.getLoginAccept).toHaveBeenCalled();
        });
    });
});
