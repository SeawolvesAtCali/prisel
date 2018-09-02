import * as handler from '../controllerHandler';
import * as roomMessages from '../message/room';

jest.mock('../networkUtils');

describe('controllerHandler', () => {
    describe('handleLogin', () => {
        // @ts-ignore
        let mockStateManager;
        // @ts-ignore
        let mockContext;
        // @ts-ignore
        let mockSocketManager;
        beforeEach(() => {
            mockStateManager = {
                connections: {
                    controllers: {},
                },
            };
            mockSocketManager = {
                add: jest.fn().mockName('SocketManager.add'),
            };
            mockContext = {
                StateManager: mockStateManager,
                SocketManager: mockSocketManager,
                io: {},
            };
        });

        it('should save the connection in StateManager', () => {
            // @ts-ignore
            handler.handleLogin(mockContext, {})({ username: 'Batman' });
            expect(
                // @ts-ignore
                Object.values(mockStateManager.connections.controllers).find(
                    // @ts-ignore
                    (controller) => controller.username === 'Batman',
                ),
            ).toEqual(expect.any(Object));
        });

        it('should save the connection in SocketMap', () => {
            const mockClient = {};
            // @ts-ignore
            handler.handleLogin(mockContext, mockClient)({ username: 'Batman' });
            // @ts-ignore
            expect(mockSocketManager.add).toHaveBeenCalledWith(expect.any(String), mockClient);
        });
        it('should emit login accept message back to client', () => {
            // @ts-ignore
            roomMessages.getLoginAccept = jest.fn(() => []).mockName('getLoginAccept');
            // @ts-ignore
            handler.handleLogin(mockContext, {})({ username: 'Batman' });
            expect(roomMessages.getLoginAccept).toHaveBeenCalled();
        });
    });
});
