import { Action, Anim, animationMap, ChanceInput } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { broadcast, Packet, TurnOrder } from '@prisel/server';
import { endState, newState, StateConfig } from '@prisel/state';
import { getGamePlayer, PlayingAnimation } from '../stateMachine/utils';

export function* collectibleHandler(props: {
    input: ChanceInput<'collectible'>;
    setNextState: (nextState: StateConfig<any>) => void;
    turnOrder: TurnOrder;
}) {
    const { turnOrder, input } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    if (!currentPlayer) {
        return endState();
    }
    const inputArgs = input.inputArgs;
    currentPlayer.addCollectible(input);
    broadcast(
        turnOrder.getAllPlayers(),
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

    yield newState(PlayingAnimation, {
        animation: Anim.create('player_emotion', monopolypb.PlayerEmotionExtra)
            .setExtra({
                player: currentPlayer.getGamePlayerInfo(),
                emotion: monopolypb.PlayerEmotionExtra_EmotionType.CHEER,
            })
            .setLength(animationMap.player_emotion),
        turnOrder,
    });

    return endState();
}
