import { Action, exist, Property } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import {
    actionRequestEvent,
    broadcast,
    Packet,
    Response,
    TurnOrder,
    useEventHandler,
} from '@prisel/server';
import { endState, useLocalState, useSideEffect, useStored } from '@prisel/state';
import Game from '../Game';
import { getGame, getGamePlayer } from './utils';

export function GameOverState(props: { turnOrder: TurnOrder }) {
    const game = getGame();
    const { turnOrder } = props;
    useSideEffect(() => {
        broadcast(
            turnOrder.getAllPlayers(),
            Packet.forAction(Action.ANNOUNCE_GAME_OVER)
                .setPayload(monopolypb.AnnounceGameOverPayload, {
                    ranks: computeRanks(game, turnOrder),
                })
                .build(),
        );
    });
    const backToRoomPlayers = useStored(new Set<string>());
    const [done, setDone] = useLocalState(false);
    useEventHandler(actionRequestEvent(Action.BACK_TO_ROOM), ({ player, packet: request }) => {
        player.respond(Response.forRequest(request).build());
        backToRoomPlayers.current.add(player.getId());
        for (const player of turnOrder.getAllPlayers()) {
            if (!backToRoomPlayers.current.has(player.getId())) {
                // not all player back to room, we will keep waiting
                return;
            }
        }
        // all player are back to room.
        setDone(true);
    });
    if (done) {
        return endState();
    }
}

function computeRanks(game: Game, turnOrder: TurnOrder): monopolypb.Rank[] {
    const propertiesWorthMap = computeProperties(game, turnOrder);
    const ranks: monopolypb.Rank[] = [];
    for (const player of turnOrder.getAllPlayers()) {
        const gamePlayer = getGamePlayer(player);
        if (!gamePlayer) {
            continue;
        }
        ranks.push({
            player: gamePlayer.getGamePlayerInfo(),
            asset: {
                cash: gamePlayer.money,
                propertyWorth: propertiesWorthMap.get(gamePlayer.id) ?? 0,
                total: gamePlayer.money + (propertiesWorthMap.get(gamePlayer.id) ?? 0),
            },
        });
    }
    ranks.sort((playerA, playerB) => {
        const playerACash = playerA.asset?.cash ?? 0;
        const playerBCash = playerB.asset?.cash ?? 0;
        if (playerACash !== playerBCash) {
            return playerACash - playerBCash;
        }
        return (playerA.asset?.propertyWorth || 0) - (playerB.asset?.propertyWorth || 0);
    });
    return ranks;
}

function computeProperties(game: Game, turnOrder: TurnOrder) {
    const playerPropertiesWorth = new Map<string, number>();

    for (const player of turnOrder.getAllPlayers()) {
        const gamePlayer = getGamePlayer(player);
        if (gamePlayer) {
            playerPropertiesWorth.set(gamePlayer.id, 0);
        }
    }
    for (const property of game.world.getAll(Property)) {
        if (exist(property.owner) && playerPropertiesWorth.has(property.owner.get().id)) {
            playerPropertiesWorth.set(
                property.owner.get().id,
                (playerPropertiesWorth.get(property.owner.get().id) || 0) + property.getWorth(),
            );
        }
    }
    return playerPropertiesWorth;
}
