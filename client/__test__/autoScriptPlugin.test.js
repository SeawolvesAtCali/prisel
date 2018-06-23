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
    });

    describe('onConnect', () => {
        it('should setup listeners for  wait messages', () => {
            const plugin = new Plugin({
                actions: [Utils.wait('EVENT1', 'NS1')],
            });
            const mockClient = {
                on: jest.fn().mockName('on'),
            };
            plugin.setClient(mockClient);
            jest.spyOn(plugin, 'setupWaitListeners');
            plugin.onConnect({}, () => {});
            expect(plugin.setupWaitListeners).toHaveBeenCalled();
            expect(mockClient.on).toHaveBeenCalled();
        });
    });

    describe('setupWaitListeners', () => {
        let mockClient;
        beforeEach(() => {
            mockClient = {
                on: jest.fn().mockName('on'),
            };
        });
        it('should setup listeners for all wait messages', () => {
            const plugin = new Plugin({
                actions: [Utils.wait('E1', 'NS1'), Utils.wait('E2', 'NS2')],
            });
            plugin.setClient(mockClient);
            plugin.setupWaitListeners();
            expect(mockClient.on).toHaveBeenCalledTimes(2);
        });

        it('should not setup listener for waits with same message type and namespace', () => {
            const plugin = new Plugin({
                actions: [Utils.wait('E1', 'NS1'), Utils.wait('E1', 'NS1')],
            });
            plugin.setClient(mockClient);
            plugin.setupWaitListeners();
            expect(mockClient.on).toHaveBeenCalledTimes(1);
        });

        it('should setup listeners for waits withe same message type but different namespaces', () => {
            const plugin = new Plugin({
                actions: [Utils.wait('E1', 'NS1'), Utils.wait('E1', 'NS2')],
            });
            plugin.setClient(mockClient);
            plugin.setupWaitListeners();
            expect(mockClient.on).toHaveBeenCalledTimes(2);
        });
    });
    describe('onMessage', () => {
        it('should add message to messages list when receive a message', () => {
            const plugin = new Plugin();
            const emit = () => {};
            plugin.onMessage({}, emit, 'EVENT1', 'CONTROLLER', { id: 1 });
            plugin.onMessage({}, emit, 'EVENT2', 'CHAT', { id: 2 });
            expect(plugin.messages.length).toBe(2);
            expect(plugin.messages[1]).toMatchObject({
                type: 'EVENT2',
                namespace: 'CHAT',
                data: {
                    id: 2,
                },
            });
        });
    });

    describe('runWait', () => {
        let plugin;
        const emit = () => {};
        const state = {};
        beforeEach(() => {
            plugin = new Plugin();
        });
        it('should return true and increment the messageHead if message match', () => {
            plugin.messageHead = 0;
            plugin.onMessage(state, emit, 'EVENT1', 'CONTROLLER', { id: 1 });
            expect(plugin.runWait(Utils.wait('EVENT1', 'CONTROLLER'), state, emit)).toBe(true);
            expect(plugin.messageHead).toBe(1);
        });
        it('should return false if message type doesnt match', () => {
            plugin.messageHead = 0;
            plugin.onMessage(state, emit, 'EVENT2', 'CONTROLLER', {});
            expect(plugin.runWait(Utils.wait('EVENT1', 'CONTROLLER'), state, emit)).toBe(false);
            expect(plugin.messageHead).toBe(0);
        });
        it('should return false if message namespace doesnt match', () => {
            plugin.messageHead = 0;
            plugin.onMessage(state, emit, 'EVENT1', 'CHAT', {});
            expect(plugin.runWait(Utils.wait('EVENT1', 'CONTROLLER'), state, emit)).toBe(false);
            expect(plugin.messageHead).toBe(0);
        });
    });
});
