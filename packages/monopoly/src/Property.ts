import Player from './Player';
import GameObject from './GameObject';
import { Handle } from '@prisel/server';
export default interface Property {
    id: string;
    price: number;
    rent: number;
    name: string;
    owner?: Player;
}

class PropertyImpl extends GameObject implements Property {
    public price: number;
    public rent: number;
    public name: string;
    public owner: Player;
    constructor(props: Property) {
        super();
        this.price = props.price;
        this.name = props.name;
        this.owner = props.owner;
        this.rent = props.rent;
    }
}

export function create(props: Property, handle: Handle) {
    const property = new PropertyImpl(props);
    property.setHandle(handle);
    return property;
}
