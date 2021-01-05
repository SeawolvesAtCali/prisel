import { payment, prompt_purchase_spec, property } from '@prisel/protos';
import { exist } from '../exist';
import { createClass } from './createClass';
import { GameObject } from './GameObject';
import {
    DimensionMixinConfig,
    NameMixinConfig,
    OwnerMixinConfig,
    PropertyLevelMixinConfig,
    required,
} from './mixins/index';

export const PropertyClass = createClass('property', [
    required(DimensionMixinConfig),
    required(PropertyLevelMixinConfig),
    required(NameMixinConfig),
    OwnerMixinConfig,
]);

export type Property = InstanceType<typeof PropertyClass>;

export const Property = {
    purchasedBy(property: Property, owner: GameObject) {
        property.propertyLevel.current = 0;
        property.owner = owner.id;
    },

    upgrade(property: Property, newLevel: number) {
        property.propertyLevel.current = newLevel;
    },

    purchaseable(property: Property): boolean {
        return !exist(property.owner);
    },
    upgradable(property: Property, requester: GameObject): boolean {
        return (
            exist(property.owner) &&
            property.owner === requester.id &&
            property.propertyLevel.current < property.propertyLevel.levels.length - 1
        );
    },
    investable(property: Property, requester: GameObject): boolean {
        return Property.purchaseable(property) || Property.upgradable(property, requester);
    },

    getWorth(property: Property): number {
        // the worth of a property is the sum of the cost taken to
        // purchase/upgrade the property.
        return property.propertyLevel.levels.reduce(
            (prev, cur, level) =>
                level <= property.propertyLevel.current ? prev + cur.cost : prev,
            0,
        );
    },

    getBasicPropertyInfo(property: Property): property.PropertyInfo {
        return {
            name: property.name,
            pos: property.dimension.anchor,
            currentLevel: property.propertyLevel.current,
            ...property.propertyLevel.levels[property.propertyLevel.current],
        };
    },

    getNextLevel(property: Property) {
        return {
            ...Property.getBasicPropertyInfo(property),
            currentLevel: property.propertyLevel.current + 1,
            ...property.propertyLevel.levels[property.propertyLevel.current + 1],
        };
    },

    getPromptPurchaseRequest(
        property: Property,
        requester: GameObject,
        existingMoney: number,
    ): prompt_purchase_spec.PromptPurchaseRequest | null {
        if (property.propertyLevel.current >= property.propertyLevel.levels.length) {
            return null;
        }

        const nextLevel = Property.getNextLevel(property);
        return {
            property: nextLevel,
            levels: property.propertyLevel.levels,
            isUpgrade: Property.upgradable(property, requester),
            moneyAfterPurchase: existingMoney - nextLevel.cost,
        };
    },

    getPaymentForRent(property: Property, payer: string, payee: string): payment.Payment | null {
        const basicPropertyInfo = Property.getBasicPropertyInfo(property);
        if (
            basicPropertyInfo.currentLevel < 0 ||
            basicPropertyInfo.currentLevel >= property.propertyLevel.levels.length
        ) {
            return null;
        }
        return {
            payer,
            payee,
            amount: property.propertyLevel.levels[property.propertyLevel.current].rent,
            forProperty: Property.getBasicPropertyInfo(property),
        };
    },
};
