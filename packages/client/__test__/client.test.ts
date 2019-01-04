import Client from '../client';
import { createPacket } from '@prisel/common';
import { Server } from 'mock-socket';

describe('Client', () => {
    const fakeURL = 'ws://localhost:3000';
    let mockServer: Server;
    beforeEach(() => {
        mockServer = new Server(fakeURL);
    });

    afterEach(() => {
        mockServer.close();
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

    describe('on', () => {
        it('can start listening before connection', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                socket.send(createPacket('HI', { value: 3 }));
            });
            const waitForHi = new Promise((resolve) => {
                const mockCallback = jest.fn((data) => {
                    expect(data).toMatchObject({
                        value: 3,
                    });
                    resolve();
                });
                client.on('HI', mockCallback);
            });
            await client.connect();
            await waitForHi;
        });
        it('should listen for the right event', async () => {
            const client = new Client(fakeURL);
            let connection: WebSocket;
            mockServer.on('connection', (socket) => (connection = socket));
            await client.connect();
            const waitForHi = new Promise((resolve, reject) => {
                client.on('HELLO', reject);
                client.on('HI', resolve);
            });
            connection.send(createPacket('HI', {}));
            await waitForHi;
        });

        it('should be able to take a filter', async () => {
            const client = new Client(fakeURL);
            let connection: WebSocket;
            mockServer.on('connection', (socket) => (connection = socket));
            await client.connect();
            const waitForHiFive = new Promise<any>((resolve) =>
                client.on((messageType, data) => messageType === 'HI' && data.value === 5, resolve),
            );
            connection.send(createPacket('HI', { value: 3 }));
            connection.send(createPacket('HI', { value: 5 }));
            connection.send(createPacket('HI', { value: 7 }));
            const result = await waitForHiFive;
            expect(result.value).toBe(5);
        });
    });

    describe('once', () => {
        it('should resolve when receive message type', async () => {
            const client = new Client(fakeURL);
            let connection: WebSocket;
            mockServer.on('connection', (socket) => (connection = socket));
            await client.connect();
            const waitForHi = client.once('HI');
            connection.send(createPacket('HI', { value: 3 }));
            const result = await waitForHi;
            expect(result.value).toBe(3);
        });
    });
});
