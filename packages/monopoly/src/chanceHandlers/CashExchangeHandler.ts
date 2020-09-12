import {
    Action,
    Anim,
    animationMap,
    CashExchangeDirection,
    ChanceArgs,
    EmotionType,
    log,
    PlayerReceiveChancePayload,
} from '@prisel/monopoly-common';
import { broadcast, PacketType, Player } from '@prisel/server';
import { ChanceHandler } from './ChanceHander';

function checkType<T>(a: T): T {
    return a;
}

export const cashExchangeHandler: ChanceHandler<'cash_exchange'> = async (game, input) => {
    const currentPlayer = game.getCurrentPlayer();
    const inputArgs = input.inputArgs;
    const exchanges: {
        [playerId: string]: number;
    } = {};
    let playerEmotion: EmotionType = EmotionType.UNSPECIFIED;
    switch (inputArgs.direction) {
        case CashExchangeDirection.FROM_BANK:
            currentPlayer.gainMoney(inputArgs.amount);
            exchanges[currentPlayer.id] = inputArgs.amount;
            playerEmotion = EmotionType.CHEER;
            break;
        case CashExchangeDirection.TO_BANK:
            currentPlayer.gainMoney(-inputArgs.amount);
            exchanges[currentPlayer.id] = -inputArgs.amount;
            playerEmotion = EmotionType.CHEER;
            break;
        case CashExchangeDirection.FROM_ALL_OTHER_PLAYERS:
            // TODO: take account of lost players if we allow them to stay in
            // game
            const totalGainedMoney = inputArgs.amount * Array.from(game.players.keys()).length;
            currentPlayer.gainMoney(totalGainedMoney);
            exchanges[currentPlayer.id] = totalGainedMoney;
            game.players.forEach((gamePlayer) => {
                gamePlayer.gainMoney(-inputArgs.amount);
                exchanges[gamePlayer.id] = -inputArgs.amount;
            });
            playerEmotion = EmotionType.CHEER;
            break;
        case CashExchangeDirection.TO_ALL_OTHER_PLAYERS:
            const totalLostMoney = inputArgs.amount * Array.from(game.players.keys()).length;
            currentPlayer.gainMoney(-totalLostMoney);
            exchanges[currentPlayer.id] = -totalLostMoney;
            game.players.forEach((gamePlayer) => {
                gamePlayer.gainMoney(inputArgs.amount);
                exchanges[gamePlayer.id] = inputArgs.amount;
            });
            playerEmotion = EmotionType.ANGRY;
            break;
        default:
            // should not be here. game data is corrupted.
            log.severe('CashExchangeHandler cannot handle cash_exchange Chance with no direction');
            return;
    }
    broadcast<PlayerReceiveChancePayload>(game.room.getPlayers(), (player: Player) => ({
        type: PacketType.DEFAULT,
        action: Action.ANNOUNCE_CHANCE,
        payload: {
            id: currentPlayer.id,
            chance: {
                display: input.display,
                type: 'cash_exchange',
                args: checkType<ChanceArgs['cash_exchange']>({
                    exchanges,
                    myCurrentCash: game.getGamePlayer(player).cash,
                }),
            },
        },
    }));

    await Anim.processAndWait(
        (animation) => {
            currentPlayer.player.emit(animation);
        },
        Anim.create('player_emotion', {
            player: currentPlayer.getGamePlayerInfo(),
            emotion: playerEmotion,
        }).setLength(animationMap.player_emotion),
    ).promise;
};
