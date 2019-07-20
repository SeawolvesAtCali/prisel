import Player from './player';
import { ClientId, Handle } from '@prisel/server';
import GameObject from './GameObject';
import Node from './Node';

interface GameProps {
    players: Map<ClientId, Player>;
    turnOrder: Player[];
    map: Node;
}

export default interface Game extends GameProps {
    isCurrentPlayer(player: Player): boolean;
    giveTurnToNext(): void;
    processMessage(handle: Handle, playerId: ClientId, data: any): void;
}

class GameImpl extends GameObject implements Game {
    public players: Map<string, Player>;
    public turnOrder: Player[];
    public map: Node;

    constructor(props: GameProps) {
        super();
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
}

export function create(props: GameProps, handle: Handle) {
    const game = new GameImpl(props);
    game.setHandle(handle);
    return game;
}
