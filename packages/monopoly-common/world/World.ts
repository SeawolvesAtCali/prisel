import { serialize, update } from 'serializr';
import { genId } from '../genId';
import { GameObject, GameObjectClass } from './GameObject';
import { Id } from './Id';
import { Ref as Ref2 } from './ref2';

export interface SerializedWorld {
    [key: string]: Array<any>;
}

/**
 * World holds all game objects. Provide easy access to game object through ids
 */
export class World {
    private objectMap: Map<Id, GameObject> = new Map();
    private idMap: Map<string, Set<Id>> = new Map();

    constructor() {
        this.makeRef = this.makeRef.bind(this);
    }

    private createId<T extends GameObject>(specifiedId?: Id<T>): Id<T> {
        if (specifiedId && this.objectMap.has(specifiedId)) {
            throw new Error(
                `Cannot create game object of id ${specifiedId} because there is already one existing`,
            );
        }
        if (specifiedId) {
            return specifiedId;
        }
        return genId();
    }

    public get<T extends GameObject>(id: Id<T>): T | null {
        const object = this.objectMap.get(id);
        return (object as T) || null;
    }

    private getIdSetOfSameType(object: GameObject) {
        const type = object.type;
        // const gameObjectClass = this.gameObjectTypeRegistry.get(type);
        // if (gameObjectClass && object instanceof gameObjectClass) {
        const set = this.idMap.get(type);
        if (!set) {
            const newSet = new Set<string>();
            this.idMap.set(type, newSet);
            return newSet;
        }
        return set;
    }

    private getAllFromSet<T extends GameObject>(idSet: Set<Id>): T[] {
        return Array.from(idSet)
            .map((id) => this.objectMap.get(id) as T)
            .filter(Boolean);
    }

    public getAll<T extends GameObjectClass<any>>(typeOrClazz: string | T): InstanceType<T>[] {
        const typeString = typeof typeOrClazz === 'string' ? typeOrClazz : typeOrClazz.TYPE;
        const set = this.idMap.get(typeString);
        if (set) {
            return this.getAllFromSet<InstanceType<T>>(set);
        }
        return [];
    }

    /** Create a GameObject of given type, and add to world */
    public create<T extends GameObjectClass<any>>(
        clazz: T,
        id?: Id<InstanceType<T>>,
    ): InstanceType<T> {
        const object = new clazz();
        object.world = this;
        const objectId = this.createId<InstanceType<T>>(id);
        object.id = objectId;
        this.objectMap.set(objectId, object);
        this.getIdSetOfSameType(object).add(objectId);

        return object;
    }

    public createRef<T extends GameObjectClass<any>>(
        clazz: T,
        id?: Id<InstanceType<T>>,
    ): Ref2<InstanceType<T>> {
        return this.makeRef(this.create(clazz, id));
    }

    public add<T extends GameObject>(object: T) {
        if (this.idMap.get(object.type)?.has(object.id)) {
            throw new Error(`object ${object.type} already has an id ${object.id}`);
        }
        this.objectMap.set(object.id, object);
        this.getIdSetOfSameType(object).add(object.id);
        object.world = this;
    }

    public remove<T extends GameObject>(idOrGameObject: Id | T) {
        let deletedObject;
        if (typeof idOrGameObject === 'string') {
            deletedObject = this.objectMap.get(idOrGameObject);
            this.objectMap.delete(idOrGameObject);
        } else {
            deletedObject = idOrGameObject;
            this.objectMap.delete(idOrGameObject.id);
        }
        if (deletedObject) {
            this.getIdSetOfSameType(deletedObject).delete(deletedObject.id);
        }
    }

    public makeRef<T extends GameObject>(keyOrObject: Id<T> | T): Ref2<T> {
        return Ref2.of<T>(keyOrObject, this);
    }

    /**
     * Called before serializing. This method should be used to populate the
     * serializable fields in sub class.
     */
    protected populateSerializedFields(): void {}
    public serialize(): any {
        this.populateSerializedFields();
        const serialzied = serialize(this);
        this.clearSerializedFields();
        return serialzied;
    }

    /**
     * Called after deserialized. This method should be used to clear out the
     * serialized fields to reduce duplicate reference. All GameObjects should
     * already be stored inside the internal map of World.
     */
    protected clearSerializedFields(): void {}
    /**
     * deserialize into current world make sure this is an empty world,
     * otherwise we might have id collision
     * @param serialized
     */
    public populate(serialized: any) {
        this.clearSerializedFields();
        update(
            this,
            serialized,
            (err) => {
                if (err) {
                    console.error(err);
                } else {
                    this.clearSerializedFields();
                }
            },
            { world: this },
        );
        return this;
    }
}
