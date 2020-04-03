import { GamePlayer } from './GamePlayer';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import Node from './Node';
import { flattenState } from './state';
import { log } from './logGameObject';
import {
    PlayerId,
    Player,
    Room,
    ResponseWrapper,
    Request,
    Messages,
    Packet,
    PacketType,
    broadcast,
    RemoveListenerFunc,
    debug,
} from '@prisel/server';
import { Action, PlayerStartTurnPayload } from '../common/messages';
import { startTurn, Turn } from './Turn';

interface Props {
    id: string;
    players: Map<PlayerId, GamePlayer>;
    turnOrder: GamePlayer[];
    map: Node;
    room: Room;
}

interface FlatGame extends FlatGameObject {
    players: { [playerId: string]: Ref<GamePlayer> };
    turnOrder: Array<Ref<GamePlayer>>;
    map: Ref<Node>;
}

export default class Game extends GameObject {
    public id: string;
    public players: Map<string, GamePlayer>;
    public turnOrder: GamePlayer[];
    public map: Node;
    public room: Room;
    public turn: Turn;

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this.map = props.map;
        this.room = props.room;
    }

    @log
    public giveTurnToNext(): void {
        this.turnOrder = [...this.turnOrder.slice(1), this.turnOrder[0]];
    }

    public startTurn(): void {
        this.turn = startTurn(this, this.getCurrentPlayer());
        const startTurnPacket: Packet<PlayerStartTurnPayload> = {
            type: PacketType.DEFAULT,
            action: Action.PLAYER_START_TURN,
            payload: {
                id: this.turn.player.id,
            },
        };

        broadcast(this.room.getPlayers(), startTurnPacket);
    }

    public endTurn(): void {
        this.turn.end();
        this.turn = null;
    }

    public isCurrentPlayer(player: GamePlayer) {
        return this.turnOrder[0].player.equals(player.player);
    }

    public getCurrentPlayer(): GamePlayer {
        return this.turnOrder[0];
    }

    public flat(): FlatGame {
        const players: { [playerId: string]: Ref<GamePlayer> } = {};
        this.players.forEach((player, key) => {
            players[key] = this.ref(player);
        });
        return {
            id: this.id,
            players,
            map: this.ref(this.map),
            turnOrder: this.turnOrder.map(this.ref),
        };
    }

    public getPlayerId(player: Player): string {
        return this.players.get(player.getId()).id;
    }

    public getGamePlayer(player: Player): GamePlayer {
        return this.players.get(player.getId());
    }
}

export function create(props: Props) {
    return new Game(props);
}
