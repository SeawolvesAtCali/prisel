import { GamePlayer, Id, World } from '@prisel/monopoly-common';
import { broadcast, Packet, Player, PlayerId, Room } from '@prisel/server';
import { StateMachine } from './stateMachine/StateMachine';

interface Props {
    id: string;
    players: Map<PlayerId, GamePlayer>;
    getGamePlayerByPlayer: (player: Player) => GamePlayer | undefined;
    turnOrder: GamePlayer[];
    room: Room;
    world: World;
}

export default class Game {
    public id: string;
    // map of Id<GamePlayer>, GamePlayer
    public players: Map<string, GamePlayer>;
    public turnOrder: GamePlayer[];
    public room: Room;
    public stateMachine: StateMachine;
    public world: World;
    private getGamePlayerByPlayer: Props['getGamePlayerByPlayer'];

    public init(props: Props) {
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this.room = props.room;
        this.world = props.world;
        this.getGamePlayerByPlayer = props.getGamePlayerByPlayer;
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

    public getGamePlayer(player: Player): GamePlayer | undefined {
        return this.getGamePlayerByPlayer(player);
    }

    public getGamePlayerById(id: Id<GamePlayer>): GamePlayer | undefined {
        return this.players.get(id);
    }

    public broadcast(packetBuilder: ((player: GamePlayer) => Packet | undefined) | Packet) {
        broadcast(this.room.getPlayers(), (player) => {
            const gamePlayer = this.getGamePlayer(player);
            if (gamePlayer) {
                return typeof packetBuilder === 'function'
                    ? packetBuilder(gamePlayer)
                    : packetBuilder;
            }
        });
    }
}

export function create(props: Props) {
    return new Game().init(props);
}
