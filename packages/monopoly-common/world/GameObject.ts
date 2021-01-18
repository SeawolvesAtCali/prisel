import { deserialize, serialize } from 'serializr';
import { exist } from '../exist';
import { Serialized } from './serializeUtil';
import { World } from './World';

export type StaticThis<T> = { new (): T };
export abstract class GameObject {
    /**
     * type is classname. This is used during (de)serialization to identify the
     * class of game object.
     */
    public abstract get type(): string;
    /**
     * Id uniquely identify a game object
     */
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

    public serialize(): Serialized<this> {
        return { id: this.id, type: this.type, data: serialize(this) };
    }

    public static deserialize<T extends GameObject>(
        this: StaticThis<T>,
        serialized: Serialized,
        world: World,
    ) {
        const deserialized = deserialize(this, serialized.data, undefined, { world });
        deserialized.id = serialized.id;
        deserialized.world = world;
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
          deserialize(serialized: Serialized<T>, world: World): T;
      }
    : never;
