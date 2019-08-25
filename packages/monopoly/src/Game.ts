import Player from './Player';
import { ClientId, Handle } from '@prisel/server';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import Node from './Node';
import { flattenState } from './state';
import { log } from './logGameObject';

interface Props {
    id: string;
    players: Map<ClientId, Player>;
    turnOrder: Player[];
    map: Node;
}

interface FlatGame extends FlatGameObject {
    players: { [playerId: string]: Ref<Player> };
    turnOrder: Array<Ref<Player>>;
    map: Ref<Node>;
}

export default class Game extends GameObject {
    public id: string;
    public players: Map<string, Player>;
    public turnOrder: Player[];
    public map: Node;

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this.map = props.map;
    }

    public processMessage(handle: Handle, playerId: ClientId, data: any) {
        if (data.type === 'debug') {
            const flatState = flattenState(this);
            handle.emit(playerId, flatState);
            handle.log('current game state is: \n%O', flatState);
            return;
        }
        const player = this.players.get(playerId);
        if (player) {
            player.handleAction(data.type, this);
        }
    }

    @log
    public giveTurnToNext(): void {
        this.turnOrder = [...this.turnOrder.slice(1), this.turnOrder[0]];
    }

    public isCurrentPlayer(player: Player) {
        return this.turnOrder[0] === player;
    }

    public flat(): FlatGame {
        const players: { [playerId: string]: Ref<Player> } = {};
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

export function create(props: Props, handle: Handle) {
    const game = new Game(props);
    game.setHandle(handle);
    return game;
}
