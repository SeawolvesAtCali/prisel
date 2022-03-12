import {
    Action,
    Anim,
    animationMap,
    ChanceInput,
    MoneyExchangeDirection,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { broadcast, Packet, TurnOrder } from '@prisel/server';
import { endState, newState, StateConfig } from '@prisel/state';
import { log } from '../log';
import { getGamePlayer, PlayingAnimation } from '../stateMachine/utils';

export function* moneyExchangeHandler(props: {
    input: ChanceInput<'money_exchange'>;
    setNextState: (nextState: StateConfig<any>) => void;
    turnOrder: TurnOrder;
}) {
    const { input, turnOrder } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    if (!currentPlayer) {
        return endState();
    }
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
            const totalGainedMoney = inputArgs.amount * turnOrder.size;
            currentPlayer.gainMoney(totalGainedMoney);
            exchanges[currentPlayer.id] = totalGainedMoney;
            turnOrder.getAllPlayers().forEach((player) => {
                const gamePlayer = getGamePlayer(player);
                if (gamePlayer) {
                    gamePlayer.gainMoney(-inputArgs.amount);
                    exchanges[gamePlayer.id] = -inputArgs.amount;
                }
            });
            playerEmotion = monopolypb.PlayerEmotionExtra_EmotionType.CHEER;
            break;
        case MoneyExchangeDirection.TO_ALL_OTHER_PLAYERS:
            const totalLostMoney = inputArgs.amount * turnOrder.size;
            currentPlayer.gainMoney(-totalLostMoney);
            exchanges[currentPlayer.id] = -totalLostMoney;
            turnOrder.getAllPlayers().forEach((player) => {
                const gamePlayer = getGamePlayer(player);
                if (gamePlayer) {
                    gamePlayer.gainMoney(inputArgs.amount);
                    exchanges[gamePlayer.id] = inputArgs.amount;
                }
            });
            playerEmotion = monopolypb.PlayerEmotionExtra_EmotionType.ANGRY;
            break;
        default:
            // should not be here. game data is corrupted.
            log.error('CashExchangeHandler cannot handle cash_exchange Chance with no direction');
            return endState();
    }
    broadcast(turnOrder.getAllPlayers(), (player) => {
        const gamePlayer = getGamePlayer(player);
        if (!gamePlayer) {
            return;
        }
        return Packet.forAction(Action.ANNOUNCE_CHANCE)
            .setPayload(monopolypb.AnnounceRecievedChancePayload, {
                player: currentPlayer.id,
                chance: {
                    display: input.display,
                    extra: {
                        oneofKind: 'moneyExchange',
                        moneyExchange: {
                            exchanges,
                            myCurrentMoney: gamePlayer.money,
                        },
                    },
                },
            })
            .build();
    });

    yield newState(PlayingAnimation, {
        animation: Anim.create('player_emotion', monopolypb.PlayerEmotionExtra)
            .setExtra({
                player: currentPlayer.getGamePlayerInfo(),
                emotion: playerEmotion,
            })
            .setLength(animationMap.player_emotion),
        turnOrder,
    });

    return endState();
}
