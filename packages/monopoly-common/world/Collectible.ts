import { monopolypb } from '@prisel/protos';
import { serializable } from 'serializr';

export class Collectible {
    @serializable
    id = '';

    @serializable
    name = '';

    @serializable
    description = '';

    @serializable
    type: monopolypb.CollectibleExtra_CollectibleType =
        monopolypb.CollectibleExtra_CollectibleType.UNSPECIFIED;
}
