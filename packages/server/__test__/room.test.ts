import { Context } from '../src/objects';
import { GAME_PHASE } from '../src/objects/gamePhase';
import { newRoom, Room } from '../src/room';
import { mockContext } from '../src/utils/testUtils';

describe('room', () => {
    let context: Context;
    let room: Room;
    beforeEach(() => {
        context = mockContext();
        room = newRoom(context, {
            name: 'room',
        });
    });
    test('creation', () => {
        expect(room.getId()).toBeDefined();
        const id = room.getId();
        expect(context.rooms.get(id)).toBe(room);
        expect(room.getName()).toBe('room');
    });

    test('gamePhase', () => {
        expect(room.getGamePhase()).toBe(GAME_PHASE.WAITING);
        room.startGame();
        expect(room.getGamePhase()).toBe(GAME_PHASE.GAME);
        room.endGame();
        expect(room.getGamePhase()).toBe(GAME_PHASE.WAITING);
    });

    test('startGame', () => {
        jest.spyOn(context.gameConfig, 'onStart');
        room.startGame();
        expect(context.gameConfig.onStart).toHaveBeenCalledWith(room);
    });

    test('endGame', () => {
        room.startGame();
        jest.spyOn(context.gameConfig, 'onEnd');
        room.endGame();
        expect(context.gameConfig.onEnd).toHaveBeenCalledWith(room);
    });
});
