const handler = require('../controllerHandler');
const roomMessages = require('../message/room');

jest.mock('../networkUtils');

describe('controllerHandler', () => {
    describe('handleLogin', () => {
        let mockStateManager;
        let mockClient;
        beforeEach(() => {
            mockStateManager = {
                connections: {
                    controllers: [],
                },
            };
            mockClient = {};
        });
        it('should save the connection in StateManager', () => {
            handler.handleLogin(mockStateManager, mockClient)({});
            expect(
                Object.values(mockStateManager.connections.controllers).find(
                    (controller) => controller.socket === mockClient,
                ),
            ).toEqual(expect.any(Object));
        });
        it('should emit login accept message back to client', () => {
            roomMessages.getLoginAccept = jest.fn(() => []).mockName('getLoginAccept');
            handler.handleLogin(mockStateManager, mockClient)({});
            expect(roomMessages.getLoginAccept).toHaveBeenCalled();
        });
    });
});
