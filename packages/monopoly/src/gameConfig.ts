import { GameConfig } from '@prisel/server';
import { createIntialState } from './state';
import Game from './Game';

const MonopolyGameConfig: GameConfig = {
    type: 'monopoly',
    maxPlayers: 4,
    onSetup(handle) {},
    canStart(handle) {
        return handle.players.length > 1;
    },
    onStart(handle) {
        handle.attached = createIntialState(handle.players, handle);
    },
    onEnd(handle) {},
    onMessage(handle, player, data) {
        const game = handle.attached as Game;
        game.processMessage(handle, player, data);
    },
    onRemovePlayer(handle, player) {},
};

export default MonopolyGameConfig;
