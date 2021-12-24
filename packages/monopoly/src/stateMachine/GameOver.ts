import { Action, exist, Property } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet, Request, Response } from '@prisel/server';
import {
    endState,
    getAmbient,
    useEvent,
    useLocalState,
    useSideEffect,
    useStored,
} from '@prisel/state';
import Game from '../Game';
import { getPlayer } from '../utils';
import { getGame, receivedPacketEventAmbient } from './utils';

export function GameOverState() {
    const game = getGame();
    useSideEffect(() => {
        game.broadcast(
            Packet.forAction(Action.ANNOUNCE_GAME_OVER)
                .setPayload(monopolypb.AnnounceGameOverPayload, {
                    ranks: computeRanks(game),
                })
                .build(),
        );
    });
    const backToRoomEvent = useEvent(
        getAmbient(receivedPacketEventAmbient).filter(
            ({ packet }) =>
                Packet.getAction(packet) === Action.BACK_TO_ROOM && Request.isRequest(packet),
        ),
    );
    const backToRoomPlayers = useStored(new Set<string>());
    const [done, setDone] = useLocalState(false);
    useSideEffect(() => {
        if (backToRoomEvent) {
            getPlayer(backToRoomEvent.value.player).respond(
                Response.forRequest(backToRoomEvent.value.packet as Request).build(),
            );
            backToRoomPlayers.current.add(backToRoomEvent.value.player.id);
            for (const [gamePlayerId] of game.players) {
                if (!backToRoomPlayers.current.has(gamePlayerId)) {
                    // not all player back to room, we will keep waiting
                    return;
                }
            }
            // all player are back to room.
            setDone(true);
        }
    }, [backToRoomEvent]);
    if (done) {
        return endState();
    }
}

function computeRanks(game: Game): monopolypb.Rank[] {
    const propertiesWorthMap = computeProperties(game);
    return Array.from(game.players.values())
        .map((player) => ({
            player: player.getGamePlayerInfo(),
            assets: {
                cash: player.money,
                property: propertiesWorthMap.get(player.id),
                total: player.money + (propertiesWorthMap.get(player.id) || 0),
            },
        }))
        .sort((playerA, playerB) => {
            if (playerA.assets.cash !== playerB.assets.cash) {
                return playerA.assets.cash - playerB.assets.cash;
            }
            return (playerA.assets.property || 0) - (playerB.assets.property || 0);
        });
}

function computeProperties(game: Game) {
    const playerPropertiesWorth = new Map<string, number>();

    for (const player of game.players.keys()) {
        playerPropertiesWorth.set(player, 0);
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
