import { GamePlayer } from './GamePlayer';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import { log } from './logGameObject';
import { Room } from '@prisel/server';
interface Props {
    id: string;
    price: number;
    rent: number;
    name: string;
    owner?: GamePlayer;
}
export interface FlatProperty extends FlatGameObject {
    price: number;
    rent: number;
    name: string;
    owner: Ref<GamePlayer>;
}

export default class Property extends GameObject {
    public price: number;
    public rent: number;
    public name: string;
    public owner: GamePlayer;
    constructor(props: Props) {
        super();
        this.id = props.id;
        this.price = props.price;
        this.name = props.name;
        this.owner = props.owner;
        this.rent = props.rent;
    }

    public flat(): FlatProperty {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
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
