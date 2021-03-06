import { genId } from '../genId';
import { GameObject, GameObjectClass } from './GameObject';
import { Id } from './Id';
import { Ref as Ref2 } from './ref2';
import { Serialized } from './serializeUtil';

export interface SerializedWorld {
    [key: string]: Array<Serialized<GameObject>>;
}

/**
 * World holds all game objects. Provide easy access to game object through ids
 */
export class World {
    private objectMap: Map<Id, GameObject> = new Map();
    private idMap: Map<string, Set<Id>> = new Map();
    private gameObjectTypeRegistry: Map<string, GameObjectClass<any>> = new Map();
    private serializedTypes = new Set<string>();

    constructor() {
        this.makeRef = this.makeRef.bind(this);
    }

    public registerObject<T extends GameObjectClass<any>>(clazz: T, enableSerialization = true) {
        const type = clazz.TYPE;
        this.gameObjectTypeRegistry.set(type, clazz);
        this.idMap.set(type, new Set());
        if (enableSerialization) {
            this.serializedTypes.add(type);
        }
        return this;
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
        const gameObjectClass = this.gameObjectTypeRegistry.get(type);
        if (gameObjectClass && object instanceof gameObjectClass) {
            return this.idMap.get(type) ?? null;
        }
        return null;
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
        this.getIdSetOfSameType(object)?.add(objectId);

        return object;
    }

    public createRef<T extends GameObjectClass<any>>(
        clazz: T,
        id?: Id<InstanceType<T>>,
    ): Ref2<InstanceType<T>> {
        return this.makeRef(this.create(clazz, id));
    }

    public add<T extends GameObject>(object: T) {
        if (!this.idMap.has(object.type)) {
            throw new Error(`object type ${object.type} is not registered`);
        }
        if (this.idMap.get(object.type)?.has(object.id)) {
            throw new Error(`object ${object.type} already has an id ${object.id}`);
        }
        this.objectMap.set(object.id, object);
        this.getIdSetOfSameType(object)?.add(object.id);
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
            this.getIdSetOfSameType(deletedObject)?.delete(deletedObject.id);
        }
    }

    public makeRef<T extends GameObject>(keyOrObject: Id<T> | T): Ref2<T> {
        return Ref2.of<T>(keyOrObject, this);
    }

    public serialize(): SerializedWorld {
        const serialized = {};
        for (const serializedObjectType of Array.from(this.serializedTypes)) {
            Object.assign(serialized, {
                [serializedObjectType]:
                    this.getAll(serializedObjectType).map((object: GameObject) =>
                        object.serialize(),
                    ) ?? [],
            });
        }
        return serialized;
    }

    /**
     * deserialize into current world make sure this is an empty world,
     * otherwise we might have id collision
     * @param serialized
     */
    public deserialize(serialized: SerializedWorld) {
        for (const key of Object.keys(serialized)) {
            if (this.serializedTypes.has(key) && this.gameObjectTypeRegistry.has(key)) {
                const clazz = this.gameObjectTypeRegistry.get(key);
                if (clazz) {
                    for (const serializedObject of serialized[key]) {
                        clazz.deserialize(serializedObject, this);
                    }
                } else {
                    console.error(
                        `Cannot deserialize object of type ${key}, type might not be registered in this world.`,
                    );
                }
            }
        }
        return this;
    }

    /**
     * return a new world by copying all gameObjects in the world. GameObjects are
     * serialzied and deserialized. If a gameObject has lossy serialization or
     * deserialization, the copy might not be identical
     */
    public copy() {
        const newWorld = new World();
        for (const objectClass of this.gameObjectTypeRegistry.values()) {
            newWorld.registerObject(objectClass);
        }
        return newWorld.deserialize(this.serialize());
    }
}
