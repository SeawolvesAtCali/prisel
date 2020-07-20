import { MixinConfig } from './MixinConfig';

export function hasMixin<MixinT, SerializedT, Type extends string>(
    object: any,
    config: MixinConfig<MixinT, SerializedT, Type>,
): object is MixinT {
    return (
        object.hasOwnProperty(config.type) &&
        object[config.type] !== undefined &&
        object[config.type] !== null
    );
}

export function serializedHasMixin<MixinT, SerializedT, Type extends string>(
    serialized: any,
    config: MixinConfig<MixinT, SerializedT, Type>,
): serialized is SerializedT {
    return (
        serialized.hasOwnProperty(config.type) &&
        serialized[config.type] !== undefined &&
        serialized[config.type] !== null
    );
}
