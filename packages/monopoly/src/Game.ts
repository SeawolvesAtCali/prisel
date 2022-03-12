import { GamePlayer, Id, World } from '@prisel/monopoly-common';
import { assertExist, TurnOrder } from '@prisel/server';
import { getGamePlayer } from './stateMachine/utils';

interface Props {
    id: string;
    turnOrder: TurnOrder;
    world: World;
}

export default class Game {
    public id: string = '';
    public turnOrder?: TurnOrder;
    private _world?: World;
    public get world() {
        return assertExist(this._world);
    }

    public init(props: Props) {
        this.id = props.id;
        this.turnOrder = props.turnOrder;
        this._world = props.world;
        return this;
    }

    /**
     * Returns the {@link GamePlayer} by searching using the id. If player
     * already leave the room, this will return undefined.
     * @param id Id of {@link GamePlayer}.
     * @returns
     */
    public getGamePlayerById(id: Id<GamePlayer>): GamePlayer | undefined {
        for (const player of this.turnOrder?.getAllPlayers() || []) {
            const gamePlayer = getGamePlayer(player);
            if (gamePlayer?.id === id) {
                return gamePlayer;
            }
        }
    }
}

export function create(props: Props) {
    return new Game().init(props);
}
