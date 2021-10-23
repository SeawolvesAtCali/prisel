import { Action, Anim, animationMap, ChanceInput } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet } from '@prisel/server';
import { endState, newState, StateConfig } from '@prisel/state';
import { AnimatingAllPlayers, getCurrentPlayer, getGame } from '../stateMachine/utils';

export function* collectibleHandler(props: {
    input: ChanceInput<'collectible'>;
    setNextState: (nextState: StateConfig<any>) => void;
}) {
    const currentPlayer = getCurrentPlayer();
    const game = getGame();
    const { input, setNextState } = props;
    const inputArgs = input.inputArgs;
    currentPlayer.addCollectible(input);
    game.broadcast(
        Packet.forAction(Action.ANNOUNCE_CHANCE)
            .setPayload(monopolypb.AnnounceRecievedChancePayload, {
                player: currentPlayer.id,
                chance: {
                    display: input.display,
                    extra: {
                        oneofKind: 'collectible',
                        collectible: {
                            type: inputArgs.type,
                        },
                    },
                },
            })
            .build(),
    );

    yield newState(
        AnimatingAllPlayers,
        Anim.create('player_emotion', monopolypb.PlayerEmotionExtra)
            .setExtra({
                player: currentPlayer.getGamePlayerInfo(),
                emotion: monopolypb.PlayerEmotionExtra_EmotionType.CHEER,
            })
            .setLength(animationMap.player_emotion),
    );

    return endState();
}
