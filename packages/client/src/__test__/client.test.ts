import { Packet, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { Server } from 'mock-socket';
import { Client } from '../client';
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
            const loginRequest = getLogin(client.newId(), 'batman');
            expect(Request.isRequest(loginRequest));
            mockServer.on('connection', (socket) => {
                socket.on('message', (data) => {
                    const pkt = Packet.deserialize(data);
                    expect(Request.isRequest(pkt)).toBe(true);
                    expect(Packet.isSystemAction(pkt, priselpb.SystemActionType.LOGIN));
                    expect(Packet.getPayload(pkt, 'loginRequest')).toMatchObject<
                        priselpb.LoginRequest
                    >({
                        username: 'batman',
                    });

                    const loginResponse = Response.forRequest(pkt as Request)
                        .setPayload('loginResponse', {
                            userId: '123',
                        })
                        .build();
                    socket.send(Packet.serialize(loginResponse));
                });
            });
            await client.connect();
            const loginResult = await client.request(loginRequest);
            expect(Response.isResponse(loginResult));
            expect(Packet.isSystemAction(loginResult, priselpb.SystemActionType.LOGIN)).toBe(true);
            const payload = Packet.getPayload(loginResult, 'loginResponse');
            expect(payload).toBeDefined();
            if (payload) {
                expect(payload.userId).toBe('123');
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
                    const packet = Packet.deserialize(data);
                    if (Packet.isSystemAction(packet, priselpb.SystemActionType.EXIT)) {
                        // do nothing on EXIT
                        return;
                    }
                    expect(Request.isRequest(packet)).toBe(true);
                    const loginResponse = Response.forRequest(packet as Request)
                        .setPayload('loginResponse', {
                            userId: '123',
                        })
                        .build();
                    socket.send(Packet.serialize(loginResponse));
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
                    const packet = Packet.deserialize(data);
                    if (Packet.isSystemAction(packet, priselpb.SystemActionType.EXIT)) {
                        // do nothing on EXIT
                        return;
                    }
                    expect(Request.isRequest(packet)).toBe(true);
                    const loginResponse = Response.forRequest(packet as Request)
                        .setPayload('loginResponse', {
                            userId: '123',
                        })
                        .build();
                    socket.send(Packet.serialize(loginResponse));
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
                socket.send(Packet.serialize(pkt));
            });
            const waitForMessage = new Promise<void>((resolve) => {
                const mockCallback = (packet: Packet, action: string) => {
                    expect(Packet.is(packet)).toBe(true);
                    expect(packet.type).toEqual(priselpb.PacketType.DEFAULT);
                    expect(Packet.isCustomAction(packet, 'MESSAGE'));
                    resolve();
                };
                client.on('MESSAGE', mockCallback);
            });
            await client.connect();
            await waitForMessage;
        });
        it('should listen for the right event', async () => {
            const client = new Client(fakeURL);
            const connectionPromise = new Promise<WebSocket>((resolve) => {
                mockServer.on('connection', resolve);
            });
            const [connection, _] = await Promise.all([connectionPromise, client.connect()]);
            const waitForGameStart = new Promise((resolve, reject) => {
                client.on('NO', reject);
                client.on('YES', resolve);
            });
            const packet = Packet.forAction('YES').build();
            connection.send(Packet.serialize(packet));
            await waitForGameStart;
        });
    });
});
