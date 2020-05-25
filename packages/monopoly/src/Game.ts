import { GamePlayer } from './GamePlayer';
import GameObject, { FlatGameObject, Ref } from './GameObject';
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
import { Action, PlayerStartTurnPayload, PlayerEndTurnPayload } from '../common/messages';
import { startTurn, Turn } from './Turn';
import Property from './Property';
import { StateMachine } from './stateMachine/StateMachine';

interface Props {
    id: string;
    players: Map<PlayerId, GamePlayer>;
    turnOrder: GamePlayer[];
    room: Room;
    properties: Property[];
}

interface FlatGame extends FlatGameObject {
    players: { [playerId: string]: Ref<GamePlayer> };
    turnOrder: Array<Ref<GamePlayer>>;
}

export default class Game extends GameObject {
    public id: string;
    public players: Map<string, GamePlayer>;
    public turnOrder: GamePlayer[];
    public room: Room;
    public turn: Turn;
    public properties: Property[];
    public stateMachine: StateMachine;

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this.room = props.room;
        this.properties = props.properties;
    }

    @log
    public giveTurnToNext(): void {
        this.turnOrder = [...this.turnOrder.slice(1), this.turnOrder[0]];
    }

    public getNextPlayer(): GamePlayer {
        return [...this.turnOrder.slice(1), this.turnOrder[0]][0];
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
