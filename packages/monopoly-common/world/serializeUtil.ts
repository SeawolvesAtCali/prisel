import { custom, list, serializable } from 'serializr';
import { exist } from '../exist';
import { GameObject } from './GameObject';
import { Id } from './Id';
import { Ref } from './ref2';

function jsonSerializer(value: any): string {
    return JSON.stringify(value);
}

function jsonDeserializer(serialized: string): any {
    return JSON.parse(serialized);
}
const refPropSchema = custom(
    (ref: Ref<any>) => (exist(ref) ? ref.id : null),
    (jsonValue, context) =>
        jsonValue === null ? undefined : Ref.of(`${jsonValue}`, context.args.world),
);
export const refSerializable = serializable(refPropSchema);
export const listRefSerializable = serializable(list(refPropSchema));

// A simple serializer that serialize into json string
export const jsonSerializable = serializable(custom(jsonSerializer, jsonDeserializer));

export type Serialized<GameObjectType extends GameObject = GameObject> = {
    id: Id<GameObjectType>;
    type: GameObjectType['type'];
    data: object;
};
