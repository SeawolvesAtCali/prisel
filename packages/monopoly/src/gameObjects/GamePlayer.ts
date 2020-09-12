import {
    Coordinate,
    deserialize,
    GameObject,
    GamePlayerInfo,
    log,
    Payment,
    Properties,
    Property2,
    PropertyInfo,
    serialize,
    Serialized,
    Tile2,
    Tiles,
    World,
} from '@prisel/monopoly-common';
import { Player, PlayerId } from '@prisel/server';

interface Props {
    id: PlayerId;
    player: Player;
    pathTile: Tile2;
    owning: Property2[];
    cash: number;
    character: number;
    rolled: boolean;
}

function roll(startingNode: Tile2): Tile2[] {
    const steps = 3;
    // const steps = Math.trunc(Math.random() * 6) + 1;
    log.info(`player will move ${steps}`);
    return Tiles.genPath(startingNode, steps);
}

export interface GamePlayer {}
export class GamePlayer extends GameObject {
    public static TYPE: string = 'game_player';
    public get type() {
        return 'game_player';
    }
    public pathTile: Tile2;
    public owning: Property2[];
    public cash: number;
    public rolled: boolean;
    public player: Player;
    public character: number;

    public init(props: Props) {
        this.id = props.id;
        this.pathTile = props.pathTile;
        this.owning = props.owning || [];
        this.cash = props.cash;
        this.rolled = props.rolled;
        this.player = props.player;
        this.character = props.character;
        return this;
    }

    public payRent(owner: GamePlayer, property: PropertyInfo): Payment {
        this.cash = this.cash - property.rent;
        owner.gainMoney(property.rent);
        return {
            from: this.player.getId(),
            to: owner.player.getId(),
            forProperty: property,
            amount: property.rent,
        };
    }

    public gainMoney(amount: number) {
        this.cash += amount;
    }

    public rollAndMove(): Coordinate[] {
        const path = roll(this.pathTile);
        this.rolled = true;
        return this.move(path);
    }

    public move(path: Tile2[]) {
        if (path.length > 0) {
            this.pathTile = path[path.length - 1];
            return path.map((pathTile) => pathTile.position);
        }
        return [];
    }

    public purchaseProperty(property: Property2, nextLevelPropertyInfo: PropertyInfo) {
        this.cash = this.cash - nextLevelPropertyInfo.cost;
        if (property.owner !== this.id) {
            this.owning.push(property);
        }
        if (nextLevelPropertyInfo.isUpgrade) {
            Properties.upgrade(property, nextLevelPropertyInfo.currentLevel);
        } else {
            Properties.purchasedBy(property, this);
        }
    }

    public getGamePlayerInfo(): GamePlayerInfo {
        return {
            money: this.cash,
            player: {
                name: this.player.getName(),
                id: this.player.getId(),
            },
            pos: this.pathTile.position,
            character: this.character,
        };
    }

    public serialize(): Serialized<this> {
        return serialize(this, []);
    }

    public static deserialize(serialized: Serialized<GamePlayer>, world: World) {
        return deserialize(GamePlayer, serialized, [], world);
    }
}

export function create(props: Props): GamePlayer {
    return new GamePlayer().init(props);
}
