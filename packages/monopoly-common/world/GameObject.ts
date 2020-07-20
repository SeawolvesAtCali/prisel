import { Serialized } from './serialize';
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
    public id: string;

    // Child type of GameObject should all provide a no argument constructor, or
    // just don't add constructor. This allows world to create any GameObject

    public abstract serialize(): Serialized<this>;

    public static deserialize(serialized: Serialized, world: World): GameObject {
        throw new Error('cannot deserialize GameObject');
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
