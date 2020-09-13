import { World } from '@prisel/monopoly-common';
import { Player, PlayerId, Room } from '@prisel/server';
import { GamePlayer } from './gameObjects/GamePlayer';
import { StateMachine } from './stateMachine/StateMachine';

interface Props {
    id: string;
    players: Map<PlayerId, GamePlayer>;
    turnOrder: GamePlayer[];
    room: Room;
    world: World;
}

export default class Game {
    public id: string;
    public players: Map<string, GamePlayer>;
    public turnOrder: GamePlayer[];
    public room: Room;
    public stateMachine: StateMachine;
    public world: World;

    public init(props: Props) {
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this.room = props.room;
        this.world = props.world;
        return this;
    }

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

    public getPlayerId(player: Player): string {
        return this.players.get(player.getId()).id;
    }

    public getGamePlayer(player: Player): GamePlayer {
        return this.players.get(player.getId());
    }
    public getGamePlayerById(id: string): GamePlayer {
        return this.players.get(id);
    }
}

export function create(props: Props) {
    return new Game().init(props);
}
