import { GamePlayer } from './GamePlayer';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import { log } from './logGameObject';
import { PropertyInfo, Coordinate, PropertyLevel } from '@prisel/monopoly-common';
interface Props {
    id: string;
    cost: number;
    rent: number;
    name: string;
    pos: Coordinate;
}
export interface FlatProperty extends FlatGameObject {
    cost: number;
    rent: number;
    name: string;
    owner: Ref<GamePlayer>;
}

export default class Property extends GameObject {
    public name: string;
    public owner: GamePlayer;
    public pos: Coordinate;
    public level: number;
    public levels: PropertyLevel[];

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.name = props.name;
        this.pos = props.pos;

        this.level = -1;
        this.owner = undefined;
        this.populateLevels(props.cost, props.rent);
    }

    private populateLevels(startCost: number, startRent: number) {
        // for now, let's populate the cost and rent for other levels
        // programmetically
        this.levels = [
            {
                cost: startCost,
                rent: startRent,
            },
            {
                cost: startCost / 2,
                rent: startRent * 5,
            },
            {
                cost: startCost / 2,
                rent: startRent * 10,
            },
        ];
    }

    public flat(): FlatProperty {
        return {
            id: this.id,
            name: this.name,
            ...this.levels[this.level],
            owner: this.ref(this.owner),
        };
    }

    @log
    public purchasedBy(owner: GamePlayer) {
        this.level = 0;
        this.owner = owner;
    }

    @log
    public upgrade(newLevel: number) {
        this.level = newLevel;
    }

    public purchaseable(): boolean {
        return !this.owner;
    }
    public upgradable(requester: GamePlayer): boolean {
        return this.owner === requester && this.level < this.levels.length - 1;
    }
    public investable(requester: GamePlayer): boolean {
        return this.purchaseable() || this.upgradable(requester);
    }

    public getWorth(): number {
        // the worth of a property is the sum of the cost taken to
        // purchase/upgrade the property.
        return this.levels.reduce(
            (prev, cur, index) => (index <= this.level ? prev + cur.cost : prev),
            0,
        );
    }

    public getBasicPropertyInfo(): PropertyInfo {
        return {
            name: this.name,
            pos: this.pos,
            currentLevel: this.level,
        };
    }

    public getPropertyInfoForInvesting(requester: GamePlayer): PropertyInfo {
        if (this.level >= this.levels.length) {
            return undefined;
        }
        return {
            name: this.name,
            levels: this.levels,
            ...this.levels[this.level + 1],
            currentLevel: this.level + 1,
            pos: this.pos,
            isUpgrade: this.upgradable(requester),
        };
    }

    public getPropertyInfoForRent(): PropertyInfo {
        if (this.level < 0 || this.level >= this.levels.length) {
            return undefined;
        }
        return {
            name: this.name,
            rent: this.levels[this.level].rent,
            currentLevel: this.level,
            pos: this.pos,
        };
    }
}

export function create(props: Props) {
    return new Property(props);
}
