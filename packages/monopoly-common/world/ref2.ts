import { assertExist } from '@prisel/common';
import { serializable } from 'serializr';
import { GameObject } from './GameObject';
import { Id } from './Id';
import { World } from './World';

export class Ref<T extends GameObject> {
    @serializable
    id;
    world: World;

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
        return assertExist(this.world, 'world').get(this.id);
    }

    equals(ref: Ref<any>) {
        return ref.id === this.id;
    }
}
