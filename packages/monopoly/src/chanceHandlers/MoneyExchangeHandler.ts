import {
    Action,
    Anim,
    animationMap,
    GamePlayer,
    MoneyExchangeDirection,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet } from '@prisel/server';
import { log } from '../log';
import { getPlayer } from '../utils';
import { ChanceHandler } from './ChanceHandler';

export const moneyExchangeHandler: ChanceHandler<'money_exchange'> = async (game, input) => {
    const currentPlayer = game.getCurrentPlayer();
    const inputArgs = input.inputArgs;
    const exchanges: {
        [playerId: string]: number;
    } = {};
    let playerEmotion: monopolypb.PlayerEmotionExtra_EmotionType =
        monopolypb.PlayerEmotionExtra_EmotionType.UNSPECIFIED;
    switch (inputArgs.direction) {
        case MoneyExchangeDirection.FROM_BANK:
            currentPlayer.gainMoney(inputArgs.amount);
            exchanges[currentPlayer.id] = inputArgs.amount;
            playerEmotion = monopolypb.PlayerEmotionExtra_EmotionType.CHEER;
            break;
        case MoneyExchangeDirection.TO_BANK:
            currentPlayer.gainMoney(-inputArgs.amount);
            exchanges[currentPlayer.id] = -inputArgs.amount;
            playerEmotion = monopolypb.PlayerEmotionExtra_EmotionType.CHEER;
            break;
        case MoneyExchangeDirection.FROM_ALL_OTHER_PLAYERS:
            // TODO: take account of lost players if we allow them to stay in
            // game
            const totalGainedMoney = inputArgs.amount * Array.from(game.players.keys()).length;
            currentPlayer.gainMoney(totalGainedMoney);
            exchanges[currentPlayer.id] = totalGainedMoney;
            game.players.forEach((gamePlayer) => {
                gamePlayer.gainMoney(-inputArgs.amount);
                exchanges[gamePlayer.id] = -inputArgs.amount;
            });
            playerEmotion = monopolypb.PlayerEmotionExtra_EmotionType.CHEER;
            break;
        case MoneyExchangeDirection.TO_ALL_OTHER_PLAYERS:
            const totalLostMoney = inputArgs.amount * Array.from(game.players.keys()).length;
            currentPlayer.gainMoney(-totalLostMoney);
            exchanges[currentPlayer.id] = -totalLostMoney;
            game.players.forEach((gamePlayer) => {
                gamePlayer.gainMoney(inputArgs.amount);
                exchanges[gamePlayer.id] = inputArgs.amount;
            });
            playerEmotion = monopolypb.PlayerEmotionExtra_EmotionType.ANGRY;
            break;
        default:
            // should not be here. game data is corrupted.
            log.error('CashExchangeHandler cannot handle cash_exchange Chance with no direction');
            return;
    }
    game.broadcast((player: GamePlayer) =>
        Packet.forAction(Action.ANNOUNCE_CHANCE)
            .setPayload(monopolypb.AnnounceRecievedChancePayload, {
                player: currentPlayer.id,
                chance: {
                    display: input.display,
                    extra: {
                        oneofKind: 'moneyExchange',
                        moneyExchange: {
                            exchanges,
                            myCurrentMoney: player.money,
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
                emotion: playerEmotion,
            })
            .setLength(animationMap.player_emotion),
        {
            onStart: (animation) => {
                getPlayer(currentPlayer).emit(animation);
            },
        },
    );
};
