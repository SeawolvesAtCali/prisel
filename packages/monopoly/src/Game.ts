import Player from './player';
import { ClientId, Handle } from '@prisel/server';
import GameObject, { IGameObject, FlatGameObject, Ref } from './GameObject';
import Node from './Node';

interface GameProps extends IGameObject {
    players: Map<ClientId, Player>;
    turnOrder: Player[];
    map: Node;
}

export default interface Game extends GameProps {
    isCurrentPlayer(player: Player): boolean;
    giveTurnToNext(): void;
    processMessage(handle: Handle, playerId: ClientId, data: any): void;
}

interface FlatGame extends FlatGameObject {
    players: { [playerId: string]: Ref<Player> };
    turnOrder: Array<Ref<Player>>;
    map: Ref<Node>;
}

class GameImpl extends GameObject implements Game {
    public id: string;
    public players: Map<string, Player>;
    public turnOrder: Player[];
    public map: Node;

    constructor(props: GameProps) {
        super();
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this.map = props.map;
    }

    public processMessage(handle: Handle, playerId: ClientId, data: any) {
        const player = this.players.get(playerId);
        if (player) {
            player.handleAction(data.type, this);
        }
    }

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

export function create(props: GameProps, handle: Handle) {
    const game = new GameImpl(props);
    game.setHandle(handle);
    return game;
}
