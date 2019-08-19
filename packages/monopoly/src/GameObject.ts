import { Handle } from '@prisel/server';

export interface FlatGameObject {
    id: string;
}

const REF_SYMBOL = Symbol('refId');

export interface IGameObject {
    id: string;
}

export interface Ref<T extends IGameObject> {
    [REF_SYMBOL]: T['id'];
}

export default abstract class GameObject implements IGameObject {
    public id: string;
    protected handle: Handle;

    constructor() {
        this.ref = this.ref.bind(this);
    }

    public static from(object: FlatGameObject): GameObject {
        throw new Error('Unimplemented');
    }

    public setHandle(handle: Handle) {
        this.handle = handle;
    }

    public abstract flat(): FlatGameObject;

    protected ref<T extends IGameObject>(object: T): Ref<T> {
        if (!object) {
            return null;
        }
        return { [REF_SYMBOL]: object.id };
    }

    public save(): [string, FlatGameObject] {
        return [this.constructor.name, this.flat()];
    }
}
