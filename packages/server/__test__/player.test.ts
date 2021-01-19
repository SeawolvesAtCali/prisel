import { Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { getWelcome } from '../message';
import { newPlayer } from '../player';
import { emit } from '../utils/networkUtils';
import { mockContext, mockSocket } from '../utils/testUtils';
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
        const socket = mockSocket();
        jest.spyOn(player, 'getSocket').mockImplementation(() => socket);
        player.emit(packet);
        jest.runAllTimers();
        expect(emit).toHaveBeenCalledWith(socket, expect.objectContaining(packet));
    });
    test('request', () => {
        jest.useFakeTimers();
        const context = mockContext();
        const player = newPlayer(context, { name: 'player', id: '1' });
        const request = Request.forSystemAction(priselpb.SystemActionType.CHAT);
        const socket = mockSocket();
        jest.spyOn(player, 'getSocket').mockImplementation(() => socket);
        player.request(request);
        jest.runAllTimers();
        expect(emit).toHaveBeenCalledWith(socket, request.setId(expect.any(String)).build());
    });
    test('response', () => {
        jest.useFakeTimers();
        const context = mockContext();
        const player = newPlayer(context, {
            name: 'player',
            id: '1',
        });
        const request = Request.forSystemAction(priselpb.SystemActionType.CREATE_ROOM)
            .setId('123')
            .build();
        const response = Response.forRequest(request).setFailure('failure message').build();
        const socket = mockSocket();
        jest.spyOn(player, 'getSocket').mockImplementation(() => socket);
        player.respond(response);
        jest.runAllTimers();
        expect(emit).toHaveBeenCalledWith(socket, response);
    });
});
