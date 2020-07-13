import {
    Coordinate,
    deserialize,
    GameObject,
    GamePlayerInfo,
    PathNode,
    Payment,
    Property,
    PropertyInfo,
    serialize,
    Serialized,
    World,
} from '@prisel/monopoly-common';
import { debug, Player, PlayerId } from '@prisel/server';

interface Props {
    id: PlayerId;
    player: Player;
    pathNode: PathNode;
    owning: Property[];
    cash: number;
    character: number;
    rolled: boolean;
}

function roll(startingNode: PathNode): PathNode[] {
    const steps = Math.trunc(Math.random() * 6) + 1;
    debug(`player will move ${steps}`);
    return startingNode.genPath(steps);
}

export interface GamePlayer {}
export class GamePlayer extends GameObject {
    public get type() {
        return 'game_player';
    }
    public pathNode: PathNode;
    public owning: Property[];
    public cash: number;
    public rolled: boolean;
    public player: Player;
    public character: number;

    public init(props: Props) {
        this.id = props.id;
        this.pathNode = props.pathNode;
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
        const path = roll(this.pathNode);
        this.rolled = true;
        return this.move(path);
    }

    public move(path: PathNode[]) {
        if (path.length > 0) {
            this.pathNode = path[path.length - 1];
            return path.map((pathNode) => pathNode.position);
        }
        return [];
    }

    public purchaseProperty(property: Property, nextLevelPropertyInfo: PropertyInfo) {
        this.cash = this.cash - nextLevelPropertyInfo.cost;
        if (property.owner !== this) {
            this.owning.push(property);
        }
        if (nextLevelPropertyInfo.isUpgrade) {
            property.upgrade(nextLevelPropertyInfo.currentLevel);
        } else {
            property.purchasedBy(this);
        }
    }

    public getGamePlayerInfo(): GamePlayerInfo {
        return {
            money: this.cash,
            player: {
                name: this.player.getName(),
                id: this.player.getId(),
            },
            pos: this.pathNode.position,
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
