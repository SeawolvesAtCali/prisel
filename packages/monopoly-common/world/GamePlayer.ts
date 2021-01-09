import { coordinate, game_player, payment, prompt_purchase_spec, property } from '@prisel/protos';
import { serializable } from 'serializr';
import { GameObject } from './GameObject';
import { Id } from './Id';
import type { Property } from './Property';
import { Ref } from './ref2';
import { listRefSerializable, refSerializable } from './serializeUtil';
import type { Tile } from './Tile';

interface Props {
    id: Id<GamePlayer>;
    player: any;
    pathTile: Tile;
    owning: Property[];
    money: number;
    character: number;
    rolled: boolean;
}

export class GamePlayer extends GameObject {
    public static TYPE = 'game_player';
    public readonly type = 'game_player';
    @serializable
    money = 0;

    @listRefSerializable
    owning: Ref<Property>[] = [];

    @refSerializable
    pathTile: Ref<Tile>;

    @serializable
    rolled = false;

    @serializable
    character = 0;

    player: any;

    forcedRollPoint = 0;

    public init(props: Props) {
        this.id = props.id;
        this.pathTile = this.world.makeRef(props.pathTile);
        this.owning = (props.owning || []).map(this.world.makeRef);
        this.money = props.money;
        this.rolled = props.rolled;
        this.player = props.player;
        this.character = props.character;
        return this;
    }

    public payRent(owner: GamePlayer, property: property.PropertyInfo): payment.Payment {
        this.money = this.money - property.rent;
        owner.gainMoney(property.rent);
        return {
            payer: this.id,
            payee: owner.id,
            forProperty: property,
            amount: property.rent,
        };
    }

    public gainMoney(amount: number) {
        this.money += amount;
    }

    private roll(startingNode: Ref<Tile>): Tile[] {
        if (this.forcedRollPoint) {
            // player will move a fixed ${forcedRollPoint} step
            return startingNode.get().genPath(this.forcedRollPoint);
        }
        const steps = Math.trunc(Math.random() * 6) + 1;

        return startingNode.get().genPath(steps);
    }

    public rollAndMove(): coordinate.Coordinate[] {
        const path = this.roll(this.pathTile);
        this.rolled = true;
        return this.move(path);
    }

    public move(path: Tile[]) {
        if (path.length > 0) {
            this.pathTile = this.world.makeRef(path[path.length - 1]);
            return path.map((pathTile) => pathTile.position);
        }
        return [];
    }

    public purchaseProperty(
        property: Property,
        nextLevelPropertyInfo: prompt_purchase_spec.PromptPurchaseRequest,
    ) {
        if (!nextLevelPropertyInfo.property) {
            return;
        }
        this.money = this.money - nextLevelPropertyInfo.property?.cost;
        if (property.owner?.id !== this.id) {
            this.owning.push(this.world.makeRef(property));
        }
        if (nextLevelPropertyInfo.isUpgrade) {
            property.upgrade(nextLevelPropertyInfo.property?.currentLevel);
        } else {
            property.purchasedBy(this);
        }
    }

    public getGamePlayerInfo(): game_player.GamePlayer {
        return {
            id: this.id,
            money: this.money,
            pos: this.pathTile.get().position,
            character: this.character,
        };
    }
}
