import Client from '../client';
import { createPacket } from '@prisel/common';
import { Server } from 'mock-socket';
import { MessageType } from '@prisel/common';

describe('Client', () => {
    const fakeURL = 'ws://localhost:3000';
    let mockServer: Server;
    beforeEach(() => {
        mockServer = new Server(fakeURL);
    });

    afterEach(() => {
        mockServer.stop();
    });

    describe('constructor', () => {
        it('should instantiate', () => {
            expect(() => new Client()).not.toThrow();
        });
    });

    describe('connect', () => {
        it('should resolve when receive open event', async () => {
            const client = new Client(fakeURL);
            const connection = await client.connect();
            expect(connection).toBeDefined();
        });
        it('should reject when connection timeout', async () => {
            jest.useFakeTimers();
            const client = new Client(fakeURL);
            const connectionPromise = client.connect();
            jest.runAllTimers();
            await expect(connectionPromise).rejects.toThrowError();
            jest.useRealTimers();
        });
    });

    describe('login', () => {
        it('should login with username', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                socket.on('message', (data: string) => {
                    expect(data).toBe(
                        createPacket(MessageType.LOGIN, {
                            username: 'batman',
                        }),
                    );
                    socket.send(
                        createPacket(MessageType.SUCCESS, {
                            action: MessageType.LOGIN,
                            userId: '123',
                        }),
                    );
                });
            });
            await client.connect();
            const loginResult = await client.login('batman');
            expect(loginResult.userId).toBe('123');
        });
        it('should reject if timeout', async () => {
            const client = new Client(fakeURL);
            await client.connect();
            jest.useFakeTimers();
            const loginPromise = client.login('batman');
            jest.advanceTimersByTime(6000);
            expect(loginPromise).rejects.toThrowError();
            jest.useRealTimers();
        });
        it('should reject if connection closes before login', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                socket.on('message', () => {
                    socket.send(
                        createPacket(MessageType.SUCCESS, {
                            action: MessageType.LOGIN,
                            userId: '123',
                        }),
                    );
                });
            });
            await client.connect();
            client.exit();
            expect(client.login('batman')).rejects.toThrowError('connection closed');
        });
        it('should reject if connection closes during login', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                socket.on('message', () => {
                    socket.send(
                        createPacket(MessageType.SUCCESS, {
                            action: MessageType.LOGIN,
                            userId: '123',
                        }),
                    );
                });
            });
            await client.connect();
            const loginPromise = client.login('batman');
            client.exit();
            expect(loginPromise).rejects.toThrowError('connection closed');
        });
    });

    describe('on', () => {
        it('can start listening before connection', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                socket.send(createPacket(MessageType.MESSAGE, { value: 3 }));
            });
            const waitForMessage = new Promise((resolve) => {
                const mockCallback = (data: unknown) => {
                    expect(data).toMatchObject({
                        value: 3,
                    });
                    resolve();
                };
                client.on(MessageType.MESSAGE, mockCallback);
            });
            await client.connect();
            await waitForMessage;
        });
        it('should listen for the right event', async () => {
            const client = new Client(fakeURL);
            let connection: WebSocket;
            mockServer.on('connection', (socket) => (connection = socket));
            await client.connect();
            const waitForGameStart = new Promise((resolve, reject) => {
                client.on(MessageType.READY, reject);
                client.on(MessageType.GAME_START, resolve);
            });
            connection.send(createPacket(MessageType.GAME_START, {}));
            await waitForGameStart;
        });

        it('should be able to take a filter', async () => {
            const client = new Client(fakeURL);
            let connection: WebSocket;
            mockServer.on('connection', (socket) => (connection = socket));
            await client.connect();
            const waitForMessageWithValueFive = new Promise<any>((resolve) =>
                client.on(
                    (messageType, data) => messageType === MessageType.MESSAGE && data.value === 5,
                    resolve,
                ),
            );
            connection.send(createPacket(MessageType.MESSAGE, { value: 3 }));
            connection.send(createPacket(MessageType.MESSAGE, { value: 5 }));
            connection.send(createPacket(MessageType.MESSAGE, { value: 7 }));
            const result = await waitForMessageWithValueFive;
            expect(result.value).toBe(5);
        });
    });

    describe('once', () => {
        it('should resolve when receive message type', async () => {
            const client = new Client(fakeURL);
            let connection: WebSocket;
            mockServer.on('connection', (socket) => (connection = socket));
            await client.connect();
            const waitForMessage = client.once(MessageType.MESSAGE);
            connection.send(createPacket(MessageType.MESSAGE, { value: 3 }));
            const result = await waitForMessage;
            expect(result.value).toBe(3);
        });
    });
});
