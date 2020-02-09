import { GamePlayer } from './GamePlayer';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import Node from './Node';
import { flattenState } from './state';
import { log } from './logGameObject';
import { PlayerId } from '@prisel/server';

interface Props {
    id: string;
    players: Map<PlayerId, GamePlayer>;
    turnOrder: GamePlayer[];
    map: Node;
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

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this.map = props.map;
    }

    @log
    public giveTurnToNext(): void {
        this.turnOrder = [...this.turnOrder.slice(1), this.turnOrder[0]];
    }

    public isCurrentPlayer(player: GamePlayer) {
        return this.turnOrder[0] === player;
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
}

export function create(props: Props) {
    return new Game(props);
}
