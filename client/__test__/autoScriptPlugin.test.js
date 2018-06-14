const Plugin = require('../autoScriptPlugin');
const Utils = require('../autoScriptUtils');

describe('autoScriptPlugin', () => {
    describe('constructor', () => {
        it('should new with no problem', () => {
            expect(() => new Plugin()).not.toThrow();
        });
    });

    describe('runAction', () => {
        let plugin;
        let emit;
        const mockMessageCreator = (message) => [message, {}];
        beforeEach(() => {
            plugin = new Plugin();
            emit = jest.fn().mockName('emit');
        });

        it('should run emit action', () => {
            const mockNamespace = 'NAMESPACE';
            const mockMessageType = 'MESSAGE';
            const mockData = {};
            const success = plugin.runAction(
                Utils.emit(mockNamespace, mockMessageType, mockData),
                {},
                emit,
            );
            expect(emit).toHaveBeenCalledWith(mockNamespace, mockMessageType, mockData);
            expect(success).toBe(true);
        });

        it('should run emit when the action has a function', () => {
            const mockMessageType = 'MESSAGE';
            const mockUserId = '123';
            const mockState = {
                userId: mockUserId,
            };
            const messageCreator = (state) => [mockMessageType, { id: state.userId }];
            const success = plugin.runAction(
                Utils.emit('NAMESPACE', messageCreator),
                mockState,
                emit,
            );
            expect(emit).toHaveBeenCalledWith(
                'NAMESPACE',
                mockMessageType,
                expect.objectContaining({
                    id: mockUserId,
                }),
            );
            expect(success).toBe(true);
        });

        it('should wait if no message matches the type', () => {
            plugin.messages = [mockMessageCreator('MESSAGE1'), mockMessageCreator('MESSAGE2')];
            plugin.messagesHead = 0;
            const success = plugin.runAction(Utils.wait('MESSAGE3'));
            expect(success).toBe(false);
            expect(plugin.messageHead).toBe(0);
        });

        it('should increment the messageHead if found a message', () => {
            plugin.messages = [
                mockMessageCreator('MESSAGE1'),
                mockMessageCreator('MESSAGE2'),
                mockMessageCreator('MESSAGE3'),
            ];
            const success = plugin.runAction(Utils.wait('MESSAGE2'));
            expect(success).toBe(true);
            expect(plugin.messageHead).toBe(2);
        });
    });
});
