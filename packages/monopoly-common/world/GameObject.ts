import { deserialize, serializable, serialize } from 'serializr';
import { exist } from '../exist';
import { StaticThis } from './staticThis';
import { World } from './World';

export abstract class GameObject {
    /**
     * type is classname. This is used during (de)serialization to identify the
     * class of game object.
     */
    public abstract get type(): string;
    /**
     * Id uniquely identify a game object
     */
    @serializable
    public id: string = '';

    private _world?: World;
    public get world() {
        if (exist(this._world)) {
            return this._world;
        }
        throw new Error(`GameObject with id ${this.id} doesn't have a world assigned`);
    }
    public set world(world: World) {
        this._world = world;
    }

    // Child type of GameObject should all provide a no argument constructor, or
    // just don't add constructor. This allows world to create any GameObject

    public serialize() {
        return serialize(this);
    }

    public static deserialize<T extends GameObject>(
        this: StaticThis<T>,
        serialized: any,
        world: World,
    ) {
        const deserialized = deserialize(this, serialized, undefined, { world });
        world.add(deserialized);
        return deserialized;
    }
    /**
     * Return true if all required mixins are initialized
     */
    public check(): boolean {
        return true;
    }
}

export type GameObjectClass<T> = T extends GameObject
    ? {
          new (): T;
          TYPE: string;
          deserialize(serialized: any, world: World): T;
      }
    : never;
