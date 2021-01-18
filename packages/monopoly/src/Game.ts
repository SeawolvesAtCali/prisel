import { exist, GamePlayer, Id, World } from '@prisel/monopoly-common';
import { assertExist, broadcast, Packet, Player, PlayerId, Room } from '@prisel/server';
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
    public id: string = '';
    // map of Id<GamePlayer>, GamePlayer
    public players: Map<string, GamePlayer> = new Map();
    public turnOrder: GamePlayer[] = [];
    private _room?: Room;
    public get room() {
        return assertExist(this._room);
    }

    public stateMachine?: StateMachine;

    private _world?: World;
    public get world() {
        return assertExist(this._world);
    }

    private getGamePlayerByPlayer: Props['getGamePlayerByPlayer'] = () => undefined;

    public init(props: Props) {
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this._room = props.room;
        this._world = props.world;
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
        const currentPlayerId = this.turnOrder[0].id;
        const playerId = player.getGamePlayerInfo().id;
        return exist(currentPlayerId) && currentPlayerId === playerId;
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
