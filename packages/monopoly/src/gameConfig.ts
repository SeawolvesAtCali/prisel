import { GameConfig, Messages } from '@prisel/server';
import { createIntialState, flattenState } from './state';

const MonopolyGameConfig: GameConfig = {
    type: 'monopoly',
    maxPlayers: 4,
    onSetup(handle) {},
    canStart(handle) {
        return handle.players.length > 1;
    },
    onStart(handle) {
        const gameState = handle.setState(createIntialState(handle.players));
        handle.broadcast(handle.players, ...Messages.getGameState(flattenState(gameState)));
    },
    onEnd(handle) {},
    onMessage(handle, player, data) {},
    onRemovePlayer(handle, player) {},
};

export default MonopolyGameConfig;
