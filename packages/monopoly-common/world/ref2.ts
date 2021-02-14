import { assertExist } from '@prisel/common';
import { GameObject } from './GameObject';
import { Id } from './Id';
import { World } from './World';

export class Ref<T extends GameObject> {
    id: Id<T>;
    world?: World;

    static of<T extends GameObject>(object: T | Id<T>, world: World): Ref<T> {
        const ref = new Ref<T>(object instanceof GameObject ? object.id : object);
        ref.world = world;
        return ref;
    }

    static forTest<T extends GameObject>(object: T | Id<T>): Ref<T> {
        const ref = new Ref<T>(object instanceof GameObject ? object.id : object);
        return ref;
    }

    constructor(id: Id<T>) {
        this.id = id;
    }

    get(): T {
        return assertExist(this.world?.get(this.id), `world or object with id ${this.id}`);
    }

    equals(ref: Ref<any>) {
        return ref.id === this.id;
    }
}
