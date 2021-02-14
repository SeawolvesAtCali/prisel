import { Action, Anim, animationMap } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet } from '@prisel/server';
import { ChanceHandler } from './ChanceHandler';

export const collectibleHandler: ChanceHandler<'collectible'> = async (game, input) => {
    const currentPlayer = game.getCurrentPlayer();
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

    await Anim.wait(
        Anim.create('player_emotion', monopolypb.PlayerEmotionExtra)
            .setExtra({
                player: currentPlayer.getGamePlayerInfo(),
                emotion: monopolypb.PlayerEmotionExtra_EmotionType.CHEER,
            })
            .setLength(animationMap.player_emotion),
        { onStart: game.broadcast.bind(game) },
    );
};
