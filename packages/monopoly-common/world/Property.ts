import { monopolypb } from '@prisel/protos';
import { serializable } from 'serializr';
import { exist } from '../exist';
import { Size } from '../types';
import { GameObject } from './GameObject';
import { GamePlayer } from './GamePlayer';
import { Ref } from './ref2';
import { raw, refSerializable } from './serializeUtil';

export class Property extends GameObject {
    static TYPE = 'property';
    readonly type = 'property';

    @raw
    anchor: monopolypb.Coordinate = { row: -1, col: -1 };

    @raw
    size: Size = { width: 0, height: 0 };

    @serializable
    currentLevel = -1;

    @raw
    levels: monopolypb.PropertyLevel[] = [];

    @serializable
    name = '';

    @refSerializable
    owner?: Ref<GamePlayer>;

    purchasedBy(owner: GamePlayer) {
        this.currentLevel = 0;
        this.owner = Ref.of(owner, this.world);
    }

    upgrade(newLevel: number) {
        this.currentLevel = newLevel;
    }

    purchaseable(): boolean {
        return !exist(this.owner);
    }

    upgradable(requester: GamePlayer): boolean {
        return (
            exist(this.owner) &&
            this.owner.id === requester.id &&
            this.currentLevel < this.levels.length - 1
        );
    }

    investable(requester: GamePlayer): boolean {
        return this.purchaseable() || this.upgradable(requester);
    }

    getWorth() {
        // the worth of a property is the sum of the cost taken to
        // purchase/upgrade the property.
        return this.levels.reduce(
            (prev, cur, level) => (level <= this.currentLevel ? prev + cur.cost : prev),
            0,
        );
    }

    getBasicPropertyInfo(): monopolypb.PropertyInfo {
        return {
            name: this.name,
            pos: this.anchor,
            currentLevel: this.currentLevel,
            ...this.levels[this.currentLevel],
        };
    }

    getNextLevel(): monopolypb.PropertyInfo {
        return {
            ...this.getBasicPropertyInfo(),
            currentLevel: this.currentLevel + 1,
            ...this.levels[this.currentLevel + 1],
        };
    }

    getPromptPurchaseRequest(
        requester: GamePlayer,
        existingMoney: number,
    ): monopolypb.PromptPurchaseRequest | null {
        if (this.currentLevel >= this.levels.length) {
            // max level
            return null;
        }
        const nextLevel = this.getNextLevel();
        if (existingMoney < nextLevel.cost) {
            // not enough money
            return null;
        }

        return {
            property: nextLevel,
            levels: this.levels,
            isUpgrade: this.upgradable(requester),
            moneyAfterPurchase: existingMoney - nextLevel.cost,
        };
    }

    getPaymentForRent(property: Property, payer: string, payee: string): monopolypb.Payment | null {
        const basicPropertyInfo = this.getBasicPropertyInfo();
        if (
            basicPropertyInfo.currentLevel < 0 ||
            basicPropertyInfo.currentLevel >= this.levels.length
        ) {
            return null;
        }
        return {
            payer,
            payee,
            amount: this.levels[this.currentLevel].rent,
            forProperty: this.getBasicPropertyInfo(),
        };
    }
}
