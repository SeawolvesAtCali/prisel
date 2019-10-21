import { GameConfig } from '@prisel/server';
import { createIntialState } from './state';
import Game from './Game';
import { GAME_PHASE } from '@prisel/server/objects/gamePhase';
import { isPayload } from '@prisel/common';

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
            if (isPayload(data)) {
                game.processMessage(handle, player, data);
            }
        }
        if (isPayload(data) && data.type === 'get_room_state') {
            handle.emit(player, {
                request: 'get_room_state',
                players: handle.players
                    .map((id) => {
                        const playerInfo = handle.getPlayerInfo(id);
                        if (playerInfo) {
                            return {
                                username: playerInfo.username,
                                id: playerInfo.id,
                                isReady: playerInfo.isReady,
                                isHost: handle.host === id,
                            };
                        }
                    })
                    .filter(Boolean),
            });
        }
    },
    onRemovePlayer(handle, player) {},
};

export default MonopolyGameConfig;
