import { GameConfig } from '@prisel/server';
import { createIntialState } from './state';
import Game from './Game';
import { GAME_PHASE } from '@prisel/server/objects/gamePhase';

const MonopolyGameConfig: GameConfig = {
    type: 'monopoly',
    maxPlayers: 4,
    onSetup(handle) {},
    canStart(handle) {
        return handle.players.length > 1;
    },
    onStart(handle) {
        const game = createIntialState(handle.players, handle);
        handle.attached = game;
        handle.log('The first player is %O', game.turnOrder[0].flat());
    },
    onEnd(handle) {},
    onMessage(handle, player, data) {
        if (handle.gamePhase === GAME_PHASE.GAME) {
            const game = handle.attached as Game;
            game.processMessage(handle, player, data);
        }
    },
    onRemovePlayer(handle, player) {},
};

export default MonopolyGameConfig;
