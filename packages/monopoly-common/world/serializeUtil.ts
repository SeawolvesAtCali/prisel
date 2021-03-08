import { custom, list, raw as _raw, serializable } from 'serializr';
import { exist } from '../exist';
import { GameObject, GameObjectClass } from './GameObject';
import { Ref } from './ref2';

const refPropSchema = custom(
    (ref: Ref<any>) => (exist(ref) ? ref.id : null),
    (jsonValue, context) =>
        jsonValue === null ? undefined : Ref.of(`${jsonValue}`, context.args.world),
);
export const refSerializable = serializable(refPropSchema);
export const listRefSerializable = serializable(list(refPropSchema));

// A simple serializer that serialize into json string
export const raw = serializable(_raw());

const getGameObjectPropSchema = (clazz: GameObjectClass<any>) =>
    custom(
        (gameObject: GameObject) => gameObject.serialize(),
        (jsonValue, context) =>
            jsonValue == null ? undefined : clazz.deserialize(jsonValue, context.args.world),
    );

export const gameObjectSerializable = (clazz: GameObjectClass<any>) =>
    serializable(getGameObjectPropSchema(clazz));

export const listGameObjectSerizable = (clazz: GameObjectClass<any>) =>
    serializable(list(getGameObjectPropSchema(clazz)));
