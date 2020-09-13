import { UnionToIntersection } from '../utils/UnionToIntersection';
import { deserialize } from './deserialize';
import { GameObject, GameObjectClass } from './GameObject';
import { hasMixin } from './mixins/hasMixin';
import { MixinConfig, MixinType } from './mixins/MixinConfig';
import { serialize, Serialized } from './serialize';
import { World } from './World';

type PartialMixinConfig<MixinConfigT extends MixinConfig<any, any, any>> = UnionToIntersection<
    MixinConfigT extends { isRequired: true }
        ? MixinType<MixinConfigT>
        : Partial<MixinType<MixinConfigT>>
>;

type GameObjectClassFromMixin<
    MixinConfigT extends MixinConfig<any, any, any>,
    GameObjectInstanceType extends PartialMixinConfig<MixinConfigT> &
        GameObject = PartialMixinConfig<MixinConfigT> & GameObject
> = GameObjectClass<GameObjectInstanceType>;

export function createClass<
    MixinConfigT extends MixinConfig<Exclude<any, keyof GameObject>, any, any>
>(typeName: string, mixins: MixinConfigT[]): GameObjectClassFromMixin<MixinConfigT> {
    return (class Child extends GameObject {
        public static TYPE: string = typeName;

        constructor() {
            super();
        }

        public get type() {
            return typeName;
        }

        serialize(): Serialized<this> {
            return serialize(this, mixins);
        }

        check() {
            return mixins
                .filter((mixinConfig) => mixinConfig.isRequired)
                .every((mixinConfig) => hasMixin(this, mixinConfig));
        }

        public static deserialize(serialized: Serialized<Child>, world: World): Child {
            return deserialize(Child, serialized, mixins, world);
        }
    } as unknown) as GameObjectClassFromMixin<MixinConfigT>;
}
