import { exist, existOrLog } from '../exist';
import { PropertyInfo } from '../types';
import { createClass } from './createClass';
import { deserialize } from './deserialize';
import { GameObject } from './GameObject';
import { DimensionMixin, DimensionMixinConfig } from './mixins/DimensionMixin';
import { hasMixin } from './mixins/hasMixin';
import { required } from './mixins/MixinConfig';
import { NameMixin, NameMixinConfig } from './mixins/NameMixin';
import { OwnerMixinConfig } from './mixins/OwnerMixin';
import { PropertyLevelMixin, PropertyLevelMixinConfig } from './mixins/PropertyLevelMixin';
import { serialize, Serialized } from './serialize';
import { World } from './World';

function missing(funcName: string, missingValue: string): string {
    return `${funcName} failed due to ${missingValue} is null or undefined`;
}
export interface Property
    extends Partial<DimensionMixin>,
        Partial<PropertyLevelMixin>,
        Partial<NameMixin> {}
export class Property extends GameObject {
    public static TYPE: string = 'property';
    public get type() {
        return 'property';
    }
    public owner: GameObject;

    public purchasedBy(owner: GameObject) {
        if (existOrLog(this.propertyLevel, missing('purchasedBy', 'propertyLevel'))) {
            this.propertyLevel.current = 0;
            this.owner = owner;
        }
    }

    public upgrade(newLevel: number) {
        if (existOrLog(this.propertyLevel, missing('upgrade', 'propertyLevel'))) {
            this.propertyLevel.current = newLevel;
        }
    }

    public purchaseable(): boolean {
        return !this.owner;
    }
    public upgradable(requester: GameObject): boolean {
        return (
            this.owner === requester &&
            exist(this.propertyLevel) &&
            this.propertyLevel.current < this.propertyLevel.levels.length - 1
        );
    }
    public investable(requester: GameObject): boolean {
        return this.purchaseable() || this.upgradable(requester);
    }

    public getWorth(): number {
        // the worth of a property is the sum of the cost taken to
        // purchase/upgrade the property.
        return (
            this.propertyLevel?.levels?.reduce(
                (prev, cur, level) =>
                    exist(this.propertyLevel) && level <= this.propertyLevel.current
                        ? prev + cur.cost
                        : prev,
                0,
            ) ?? 0
        );
    }

    public getBasicPropertyInfo(): Required<
        Pick<PropertyInfo, 'name' | 'pos' | 'currentLevel'>
    > | null {
        if (
            existOrLog(this.name, missing('getBasicPropertyInfo', 'name')) &&
            existOrLog(this.dimension, missing('getBasicPropertyInfo', 'dimension')) &&
            existOrLog(this.propertyLevel, missing('getBasicPropertyInfo', 'propertyLevel'))
        ) {
            return {
                name: this.name,
                pos: this.dimension.anchor,
                currentLevel: this.propertyLevel.current,
            };
        }
        return null;
    }

    public getPropertyInfoForInvesting(requester: GameObject): PropertyInfo | null {
        const basicPropertyInfo = this.getBasicPropertyInfo();
        if (!existOrLog(basicPropertyInfo, 'getPropertyInfoForInvesting failed.')) {
            return null;
        }
        if (
            exist(this.propertyLevel) &&
            this.propertyLevel.current >= this.propertyLevel.levels.length
        ) {
            return null;
        }
        if (exist(basicPropertyInfo) && exist(this.propertyLevel)) {
            const nextLevel = basicPropertyInfo.currentLevel + 1;
            return {
                ...basicPropertyInfo,
                currentLevel: nextLevel,
                levels: this.propertyLevel.levels,
                ...this.propertyLevel.levels[nextLevel],
                isUpgrade: this.upgradable(requester),
            };
        }
        return null;
    }

    public getPropertyInfoForRent(): PropertyInfo | null {
        const basicPropertyInfo = this.getBasicPropertyInfo();
        if (!existOrLog(basicPropertyInfo, 'Cannot getPropertyInfoForRent.')) {
            return null;
        }
        if (
            !exist(this.propertyLevel) ||
            basicPropertyInfo.currentLevel < 0 ||
            basicPropertyInfo.currentLevel >= this.propertyLevel.levels.length
        ) {
            return null;
        }
        return {
            ...basicPropertyInfo,
            rent: this.propertyLevel.levels[basicPropertyInfo.currentLevel].rent,
        };
    }

    public check() {
        return (
            hasMixin(this, DimensionMixinConfig) &&
            hasMixin(this, PropertyLevelMixinConfig) &&
            hasMixin(this, NameMixinConfig)
        );
    }

    public serialize(): Serialized<this> {
        return serialize(this, [DimensionMixinConfig, PropertyLevelMixinConfig, NameMixinConfig]);
    }

    public static deserialize(serialized: Serialized, world: World) {
        return deserialize(
            Property,
            serialized,
            [DimensionMixinConfig, PropertyLevelMixinConfig, NameMixinConfig],
            world,
        );
    }
}

export const PropertyClass = createClass('property', [
    required(DimensionMixinConfig),
    required(PropertyLevelMixinConfig),
    required(NameMixinConfig),
    OwnerMixinConfig,
]);

export type Property2 = InstanceType<typeof PropertyClass>;

export const Properties = {
    purchasedBy(property: Property2, owner: GameObject) {
        property.propertyLevel.current = 0;
        property.owner = owner.id;
    },

    upgrade(property: Property2, newLevel: number) {
        property.propertyLevel.current = newLevel;
    },

    purchaseable(property: Property2): boolean {
        return !exist(property.owner);
    },
    upgradable(property: Property2, requester: GameObject): boolean {
        return (
            exist(property.owner) &&
            property.owner === requester.id &&
            property.propertyLevel.current < property.propertyLevel.levels.length - 1
        );
    },
    investable(property: Property2, requester: GameObject): boolean {
        return Properties.purchaseable(property) || Properties.upgradable(property, requester);
    },

    getWorth(property: Property2): number {
        // the worth of a property is the sum of the cost taken to
        // purchase/upgrade the property.
        return property.propertyLevel.levels.reduce(
            (prev, cur, level) =>
                level <= property.propertyLevel.current ? prev + cur.cost : prev,
            0,
        );
    },

    getBasicPropertyInfo(
        property: Property2,
    ): Required<Pick<PropertyInfo, 'name' | 'pos' | 'currentLevel'>> {
        return {
            name: property.name,
            pos: property.dimension.anchor,
            currentLevel: property.propertyLevel.current,
        };
    },

    getPropertyInfoForInvesting(property: Property2, requester: GameObject): PropertyInfo | null {
        const basicPropertyInfo = Properties.getBasicPropertyInfo(property);

        if (property.propertyLevel.current >= property.propertyLevel.levels.length) {
            return null;
        }

        const nextLevel = basicPropertyInfo.currentLevel + 1;
        return {
            ...basicPropertyInfo,
            currentLevel: nextLevel,
            levels: property.propertyLevel.levels,
            ...property.propertyLevel.levels[nextLevel],
            isUpgrade: Properties.upgradable(property, requester),
        };
    },

    getPropertyInfoForRent(property: Property2): PropertyInfo | null {
        const basicPropertyInfo = Properties.getBasicPropertyInfo(property);
        if (
            basicPropertyInfo.currentLevel < 0 ||
            basicPropertyInfo.currentLevel >= property.propertyLevel.levels.length
        ) {
            return null;
        }
        return {
            ...basicPropertyInfo,
            rent: property.propertyLevel.levels[basicPropertyInfo.currentLevel].rent,
        };
    },
};
