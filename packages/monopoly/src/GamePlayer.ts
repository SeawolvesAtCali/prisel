import { debug, Player, PlayerId } from '@prisel/server';
import Property from './Property';
import { log } from './logGameObject';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import PathNode from './PathNode';
import { PropertyInfo, Payment, Coordinate, GamePlayerInfo } from '../common/types';

interface Props {
    id: PlayerId;
    player: Player;
    pathNode: PathNode;
    owning: Property[];
    cash: number;
    character: number;
    rolled: boolean;
}

export interface FlatPlayer extends FlatGameObject {
    position: Ref<PathNode>;
    owning: Array<Ref<Property>>;
    cash: number;
    rolled: boolean;
}

function roll(startingNode: PathNode): PathNode[] {
    // const steps = Math.trunc(Math.random() * 6) + 1;
    const steps = 3;
    debug(`player will move ${steps}`);
    return startingNode.genPath(steps);
}

export class GamePlayer extends GameObject {
    public pathNode: PathNode;
    public owning: Property[];
    public cash: number;
    public rolled: boolean;
    public player: Player;
    public character: number;

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.pathNode = props.pathNode;
        this.owning = props.owning || [];
        this.cash = props.cash;
        this.rolled = props.rolled;
        this.player = props.player;
        this.character = props.character;
    }

    @log
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

    @log
    public gainMoney(amount: number) {
        this.cash += amount;
    }

    public rollAndMove(): Coordinate[] {
        const path = roll(this.pathNode);
        this.rolled = true;
        this.pathNode = path[path.length - 1];
        return path.map((pathNode) => pathNode.tile.pos);
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

    public flat(): FlatPlayer {
        return {
            id: this.id,
            position: this.ref(this.pathNode),
            owning: this.owning.map(this.ref),
            cash: this.cash,
            rolled: this.rolled,
        };
    }

    public getGamePlayerInfo(): GamePlayerInfo {
        return {
            money: this.cash,
            player: {
                name: this.player.getName(),
                id: this.player.getId(),
            },
            pos: this.pathNode.tile.pos,
            character: this.character,
        };
    }
}

export function create(props: Props): GamePlayer {
    return new GamePlayer(props);
}
