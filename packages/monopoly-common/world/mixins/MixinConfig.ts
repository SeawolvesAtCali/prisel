import { SingleKeyObject } from '../../utils/SingleKeyObject';
import { SingleStringLiteral } from '../../utils/SingleStringLiteral';
import { World } from '../World';

export type MixinConfig<T, SerializedT, Type extends string> = [T, SerializedT, Type] extends [
    SingleKeyObject<T, Type>,
    SingleKeyObject<SerializedT, Type>,
    SingleStringLiteral<Type>,
]
    ? {
          type: Type;
          serialize(object: T): SerializedT | undefined;
          deserialize(serialized: SerializedT, world: World): T | undefined;
          isRequired?: boolean;
      }
    : never;

export type MixinType<ConfigType extends MixinConfig<any, any, any>> = ConfigType extends {
    serialize(object: infer T): any;
}
    ? T
    : never;

export function required<T, SerializedT, Type extends string>(
    mixinConfig: MixinConfig<T, SerializedT, Type>,
): MixinConfig<T, SerializedT, Type> & { isRequired: true } {
    return {
        ...mixinConfig,
        isRequired: true,
    };
}

interface a {
    a: string;
    b: string;
}

type b = MixinConfig<a, a, 'a'>;
