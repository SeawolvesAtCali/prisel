import { emit } from '../utils/networkUtils';
import { mockContext } from '../utils/testUtils';
import { newPlayer } from '../player';
import { getWelcome } from '../message';
import { PacketType, Request, MessageType, Status, StatusPayload } from '@prisel/common';
jest.mock('../utils/networkUtils');

describe('player', () => {
    test('creation', () => {
        const id = '123';
        const name = 'username';
        const context = mockContext();
        const player = newPlayer(context, { name, id });
        expect(player).toBeDefined();
        expect(context.players.get(id)).toBe(player);
        expect(player.getName()).toBe(name);
    });
    test('createRoom', () => {
        const context = mockContext();
        const player = newPlayer(context, { name: 'player', id: '123' });
        const room = player.createRoom({ name: 'room-1' });
        expect(context.rooms.get(room.getId())).toBe(room);
        expect(player.getRoom()).not.toBe(room);
        expect(room.getPlayers()).not.toContain(player);
    });
    test('joinRoom', () => {
        const context = mockContext();
        const player = newPlayer(context, { name: 'player', id: '1' });
        const room = player.createRoom({ name: 'room-1' });
        player.joinRoom(room.getId());
        expect(room.getPlayers()).toContain(player);
        expect(player.getRoom()).toBe(room);
    });
    test('findRoomById', () => {
        const context = mockContext();
        const player = newPlayer(context, { name: 'player', id: '1' });
        const room = player.createRoom({ name: 'room' });
        expect(player.findRoomById(room.getId())).toBe(room);
    });
    test('leaveRoom', () => {
        const context = mockContext();
        const player = newPlayer(context, { name: 'player', id: '1' });
        const room = player.createRoom({ name: 'room' });
        player.joinRoom(room.getId());
        expect(player.getRoom()).toBe(room);
        player.leaveRoom();
        expect(player.getRoom()).toBeNull();
        expect(room.getPlayers()).not.toContain(player);
    });
    test('emit', () => {
        jest.useFakeTimers();
        const player = newPlayer(mockContext(), { name: 'player', id: '1' });
        const packet = getWelcome();
        player.emit(packet);
        jest.runAllImmediates();
        expect(emit).toHaveBeenCalledWith(player.getSocket(), expect.objectContaining(packet));
    });
    test('request', () => {
        jest.useFakeTimers();
        const context = mockContext();
        const player = newPlayer(context, { name: 'player', id: '1' });
        const request: Omit<Request, 'request_id'> = {
            type: PacketType.REQUEST,
            payload: {},
        };
        player.request(request);
        jest.runAllImmediates();
        expect(emit).toHaveBeenCalledWith(
            player.getSocket(),
            expect.objectContaining({ request_id: expect.any(String) }),
        );
    });
    test('response', () => {
        jest.useFakeTimers();
        const context = mockContext();
        const player = newPlayer(context, {
            name: 'player',
            id: '1',
        });
        const request: Request = {
            type: PacketType.REQUEST,
            request_id: '123',
            system_action: MessageType.CREATE_ROOM,
        };
        player.respond<StatusPayload>(request, Status.FAILURE, { detail: '123' });
        jest.runAllImmediates();
        expect(emit).toHaveBeenCalledWith(
            player.getSocket(),
            expect.objectContaining({
                type: PacketType.RESPONSE,
                request_id: '123',
                system_action: MessageType.CREATE_ROOM,
                payload: { detail: '123' },
            }),
        );
    });
});
