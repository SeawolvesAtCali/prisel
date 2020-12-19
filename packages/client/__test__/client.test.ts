import { Packet, Request, Response, ResponseWrapper } from '@prisel/common';
import { packet, packet_type, system_action_type } from '@prisel/protos';
import { Server } from 'mock-socket';
import { Client, deserialize, serialize } from '../client';
import { getLogin } from '../message';

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
                socket.on('message', (data) => {
                    const pkt = deserialize(data);
                    expect(Request.isRequest(pkt)).toBe(true);

                    // pkt.payload.value = new Uint8Array(2); //new Uint8Array(pkt.payload.value);
                    // pkt.payload.value[0] = 1;
                    // pkt.payload.value[1] = 7;
                    expect(pkt as Request).toMatchObject<packet.Packet>({
                        type: packet_type.PacketType.REQUEST,
                        message: {
                            $case: 'systemAction',
                            systemAction: system_action_type.SystemActionType.LOGIN,
                        },
                        requestId: expect.any(String),
                        payload: {
                            payload: {
                                $case: 'loginRequest',
                                loginRequest: {
                                    username: 'batman',
                                },
                            },
                        },
                    });
                    const loginResponse = Response.forRequest(pkt as Request)
                        .setPayload('loginResponse', {
                            userId: '123',
                        })
                        .build();
                    socket.send(serialize(loginResponse));
                });
            });
            await client.connect();
            const loginResult: ResponseWrapper = await client.request(
                getLogin(client.newId(), 'batman'),
            );
            const payload = loginResult.payload.payload;
            expect(payload.$case).toBe('loginResponse');
            if (payload.$case === 'loginResponse') {
                expect(payload.loginResponse.userId).toBe('123');
            }
        });
        it('should reject if timeout', async () => {
            const client = new Client(fakeURL);
            await client.connect();
            jest.useFakeTimers();
            const loginPromise = client.request(getLogin(client.newId(), 'batman'));
            jest.advanceTimersByTime(6000);
            expect(loginPromise).rejects.toThrowError();
            jest.useRealTimers();
        });
        it('should reject if connection closes before login', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                socket.on('message', (data) => {
                    const packet = deserialize(data);
                    if (
                        Packet.isSystemAction(packet) &&
                        packet.message.systemAction === system_action_type.SystemActionType.EXIT
                    ) {
                        // do nothing on EXIT
                        return;
                    }
                    expect(Request.isRequest(packet)).toBe(true);
                    const loginResponse = Response.forRequest(packet as Request)
                        .setPayload('loginResponse', {
                            userId: '123',
                        })
                        .build();
                    socket.send(serialize(loginResponse));
                });
            });
            await client.connect();
            client.exit();
            const loginPacket = getLogin(client.newId(), 'batman');
            expect(client.request(loginPacket)).rejects.toThrowError('not connected');
        });
        it('should reject if connection closes during login', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                socket.on('message', (data) => {
                    const packet = deserialize(data);
                    if (
                        Packet.isSystemAction(packet) &&
                        packet.message.systemAction === system_action_type.SystemActionType.EXIT
                    ) {
                        // do nothing on EXIT
                        return;
                    }
                    expect(Request.isRequest(packet)).toBe(true);
                    const loginResponse = Response.forRequest(packet as Request)
                        .setPayload('loginResponse', {
                            userId: '123',
                        })
                        .build();
                    socket.send(serialize(loginResponse));
                });
            });
            await client.connect();
            const loginPromise = client.request(getLogin(client.newId(), 'batman'));
            client.exit();
            expect(loginPromise).rejects.toThrowError('connection closed');
        });
    });

    describe('on', () => {
        it('can start listening before connection', async () => {
            const client = new Client(fakeURL);
            mockServer.on('connection', (socket) => {
                const pkt = Packet.forAction('MESSAGE').build();
                socket.send(serialize(pkt));
            });
            const waitForMessage = new Promise((resolve) => {
                const mockCallback = (packet: Packet, action: string) => {
                    expect(packet).toMatchObject<Packet>({
                        type: packet_type.PacketType.DEFAULT,
                        message: {
                            $case: 'action',
                            action: 'MESSAGE',
                        },
                    });
                    resolve(undefined);
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
            const packet = Packet.forAction('YES').build();
            connection.send(serialize(packet));
            await waitForGameStart;
        });
    });
});
