import { custom, list, object, serializable } from 'serializr';
import { GameObject } from './GameObject';
import { Id } from './Id';
import { Ref } from './ref2';

function jsonSerializer(value: any): string {
    return JSON.stringify(value);
}

function jsonDeserializer(serialized: string): any {
    return JSON.parse(serialized);
}

// A simple serializer that serialize into json string
export const jsonSerializable = serializable(custom(jsonSerializer, jsonDeserializer));

export const refSerializable = serializable(object(Ref));

export const listRefSerializable = serializable(list(object(Ref)));

export type Serialized<GameObjectType extends GameObject = GameObject> = {
    id: Id<GameObjectType>;
    type: GameObjectType['type'];
    data: object;
};
