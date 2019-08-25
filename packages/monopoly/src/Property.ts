import Player from './Player';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import { Handle } from '@prisel/server';
import { log } from './logGameObject';
interface Props {
    id: string;
    price: number;
    rent: number;
    name: string;
    owner?: Player;
}
interface FlatProperty extends FlatGameObject {
    price: number;
    rent: number;
    name: string;
    owner: Ref<Player>;
}

export default class Property extends GameObject {
    public price: number;
    public rent: number;
    public name: string;
    public owner: Player;
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
    public setOwner(owner: Player) {
        this.owner = owner;
    }
}

export function create(props: Props, handle: Handle) {
    const property = new Property(props);
    property.setHandle(handle);
    return property;
}
