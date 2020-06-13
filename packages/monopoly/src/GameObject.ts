export interface FlatGameObject {
    id: string;
}

const REF_SYMBOL = Symbol('refId');

export interface Ref<T extends GameObject> {
    [REF_SYMBOL]: T['id'];
}

export default abstract class GameObject {
    public id: string;

    constructor() {
        this.ref = this.ref.bind(this);
    }

    public static from(object: FlatGameObject): GameObject {
        throw new Error('Unimplemented');
    }

    public abstract flat(): FlatGameObject;

    protected ref<T extends GameObject>(object: T): Ref<T> {
        if (!object) {
            return null;
        }
        return { [REF_SYMBOL]: object.id };
    }

    public save(): [string, FlatGameObject] {
        return [this.constructor.name, this.flat()];
    }
}
