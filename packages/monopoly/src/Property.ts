import Player from './Player';
import GameObject, { IGameObject, FlatGameObject, Ref } from './GameObject';
import { Handle } from '@prisel/server';
import { log } from './logGameObject';
interface PropertyProps extends IGameObject {
    id: string;
    price: number;
    rent: number;
    name: string;
    owner?: Player;
}

export default interface Property extends PropertyProps {
    setOwner(owner: Player): void;
}

interface FlatProperty extends FlatGameObject {
    price: number;
    rent: number;
    name: string;
    owner: Ref<Player>;
}

class PropertyImpl extends GameObject implements Property {
    public price: number;
    public rent: number;
    public name: string;
    public owner: Player;
    constructor(props: PropertyProps) {
        super();
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

export function create(props: PropertyProps, handle: Handle) {
    const property = new PropertyImpl(props);
    property.setHandle(handle);
    return property;
}
