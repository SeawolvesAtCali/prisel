import {
    Action,
    Anim,
    animationMap,
    ChanceInput,
    GamePlayer,
    MoneyExchangeDirection,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet } from '@prisel/server';
import { endState, newState, StateConfig } from '@prisel/state';
import { log } from '../log';
import { AnimatingAllPlayers, getCurrentPlayer, getGame } from '../stateMachine/utils';

export function* moneyExchangeHandler(props: {
    input: ChanceInput<'money_exchange'>;
    setNextState: (nextState: StateConfig<any>) => void;
}) {
    const game = getGame();
    const currentPlayer = getCurrentPlayer();
    const { input, setNextState } = props;
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
            return endState();
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

    yield newState(
        AnimatingAllPlayers,
        Anim.create('player_emotion', monopolypb.PlayerEmotionExtra)
            .setExtra({
                player: currentPlayer.getGamePlayerInfo(),
                emotion: playerEmotion,
            })
            .setLength(animationMap.player_emotion),
    );

    return endState();
}
