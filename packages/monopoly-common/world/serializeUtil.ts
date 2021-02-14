import { custom, list, raw as _raw, serializable } from 'serializr';
import { exist } from '../exist';
import { GameObject } from './GameObject';
import { Id } from './Id';
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

export type Serialized<GameObjectType extends GameObject = GameObject> = {
    id: Id<GameObjectType>;
    type: GameObjectType['type'];
    data: object;
};
