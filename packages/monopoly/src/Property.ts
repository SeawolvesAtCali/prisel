import { GamePlayer } from './GamePlayer';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import { log } from './logGameObject';
import { Room } from '@prisel/server';
import { PropertyInfo, Coordinate } from '../common/types';
interface Props {
    id: string;
    cost: number;
    rent: number;
    name: string;
    pos: Coordinate;
    owner?: GamePlayer;
}
export interface FlatProperty extends FlatGameObject {
    cost: number;
    rent: number;
    name: string;
    owner: Ref<GamePlayer>;
}

export default class Property extends GameObject {
    public cost: number;
    public rent: number;
    public name: string;
    public owner: GamePlayer;
    public pos: Coordinate;
    constructor(props: Props) {
        super();
        this.id = props.id;
        this.cost = props.cost;
        this.name = props.name;
        this.owner = props.owner;
        this.rent = props.rent;
        this.pos = props.pos;
    }

    public flat(): FlatProperty {
        return {
            id: this.id,
            name: this.name,
            cost: this.cost,
            rent: this.rent,
            owner: this.ref(this.owner),
        };
    }

    @log
    public setOwner(owner: GamePlayer) {
        this.owner = owner;
    }
}

export function create(props: Props) {
    return new Property(props);
}

export function toPropertyInfo(property: Property): PropertyInfo {
    return {
        name: property.name,
        cost: property.cost,
        rent: property.rent,
        pos: property.pos,
    };
}
