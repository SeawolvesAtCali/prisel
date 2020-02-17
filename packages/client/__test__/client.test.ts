import Client, { serialize, deserialize } from '../client';
import { Server } from 'mock-socket';
import {
    MessageType,
    PacketType,
    Response,
    LoginResponsePayload,
    Request,
    Packet,
    Code,
} from '@prisel/common';

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
                    const packet = deserialize(data);
                    expect(packet).toMatchObject({
                        type: PacketType.REQUEST,
                        system_action: MessageType.LOGIN,
                        request_id: expect.any(String),
                        payload: {
                            username: 'batman',
                        },
                    });
                    const loginResponse: Response<LoginResponsePayload> = {
                        type: PacketType.RESPONSE,
                        request_id: (packet as Request).request_id,
                        system_action: MessageType.LOGIN,
                        status: {
                            code: Code.OK,
                        },
                        payload: {
                            userId: '123',
                        },
                    };
                    socket.send(serialize(loginResponse));
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
                socket.on('message', (data: string) => {
                    const packet = deserialize(data);
                    const loginResponse: Response<LoginResponsePayload> = {
                        type: PacketType.RESPONSE,
                        request_id: (packet as Request).request_id,
                        system_action: MessageType.LOGIN,
                        status: {
                            code: Code.OK,
                        },
                        payload: {
                            userId: '123',
                        },
                    };
                    socket.send(serialize(loginResponse));
                });
            });
            await client.connect();
            client.exit();
            expect(client.login('batman')).rejects.toThrowError('connection closed');
        });
        it('should reject if connection closes during login', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                socket.on('message', (data: string) => {
                    const packet = deserialize(data);
                    const loginResponse: Response<LoginResponsePayload> = {
                        type: PacketType.RESPONSE,
                        request_id: (packet as Request).request_id,
                        system_action: MessageType.LOGIN,
                        status: { code: Code.OK },
                        payload: {
                            userId: '123',
                        },
                    };
                    socket.send(serialize(loginResponse));
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
                const packet: Packet = {
                    type: PacketType.DEFAULT,
                    action: 'MESSAGE',
                    payload: {
                        value: 3,
                    },
                };
                socket.send(serialize(packet));
            });
            const waitForMessage = new Promise((resolve) => {
                const mockCallback = (packet: Packet, action: string) => {
                    expect(packet.payload).toMatchObject({
                        value: 3,
                    });
                    resolve();
                };
                client.on('MESSAGE', mockCallback);
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
                client.on('NO', reject);
                client.on('YES', resolve);
            });
            const packet: Packet = {
                type: PacketType.DEFAULT,
                action: 'YES',
            };
            connection.send(serialize(packet));
            await waitForGameStart;
        });
    });
});
