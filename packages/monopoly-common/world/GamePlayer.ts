import { monopolypb, priselpb } from '@prisel/protos';
import { list, object, serializable } from 'serializr';
import { exist } from '../exist';
import { genId } from '../genId';
import { ChanceInput } from '../types';
import { Collectible } from './Collectible';
import { GameObject } from './GameObject';
import { Id } from './Id';
import type { Property } from './Property';
import { Ref } from './ref2';
import { listRefSerializable, refSerializable } from './serializeUtil';
import type { Tile } from './Tile';

// BoundPlayer is the player.ts in @prisel/server. We don't want direct
// reference to it because player.ts is from a server side package.
interface BoundPlayer {
    getPlayerInfo(): priselpb.PlayerInfo;
}
interface Props {
    id: Id<GamePlayer>;
    player: BoundPlayer;
    pathTile: Tile;
    owning: Property[];
    money: number;
    character: number;
    rolled: boolean;
}

/**
 * GamePlayer contains the information of the player controlled character in
 * game. This is the server side presentation. When transfering game player data through protobuf, use game_player.proto.
 */
export class GamePlayer extends GameObject {
    public static TYPE = 'game_player';
    public readonly type = 'game_player';
    @serializable
    money = 0;

    @listRefSerializable
    owning: Ref<Property>[] = [];

    @refSerializable
    pathTile?: Ref<Tile>;

    @serializable
    rolled = false;

    @serializable
    character = 0;

    @serializable(list(object(Collectible)))
    collectibles: Array<Collectible> = [];

    player?: BoundPlayer;

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

    public payRent(owner: GamePlayer, property: monopolypb.PropertyInfo): monopolypb.Payment {
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

    /** Returns a random number from 1 to 6 */
    public getDiceRoll(): number {
        return Math.trunc(Math.random() * 6) + 1;
    }

    private roll(startingNode: Ref<Tile>): Tile[] {
        return this.fixedRoll(startingNode, this.getDiceRoll());
    }

    private fixedRoll(startingNode: Ref<Tile>, roll: number): Tile[] {
        return startingNode.get().genPath(roll);
    }

    public rollAndMove(fixedRoll?: number): monopolypb.Coordinate[] {
        if (exist(this.pathTile)) {
            const path = exist(fixedRoll)
                ? this.fixedRoll(this.pathTile, fixedRoll)
                : this.roll(this.pathTile);
            this.rolled = true;
            return this.move(path);
        }
        throw new Error('player not in a pathTile, cannot roll and move');
    }

    public teleport(targetTile: Tile) {
        this.pathTile = this.world.makeRef(targetTile);
    }

    public move(path: Tile[]) {
        // Currently we don't do anything different for teleport.
        // When we implement onEnter and onLeave callback for tile.
        if (path.length > 0) {
            this.pathTile = this.world.makeRef(path[path.length - 1]);
            return path.map((pathTile) => pathTile.position);
        }
        return [];
    }

    public purchaseProperty(
        property: Property,
        nextLevelPropertyInfo: monopolypb.PromptPurchaseRequest,
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

    public getGamePlayerInfo(): monopolypb.GamePlayer {
        return {
            id: this.id,
            money: this.money,
            pos: this.pathTile?.get().position,
            character: this.character,
            boundPlayer: this.player?.getPlayerInfo(),
        };
    }

    public addCollectible(chanceInput: ChanceInput<'collectible'>) {
        this.collectibles.push({
            id: genId(),
            name: chanceInput.display.title,
            description: chanceInput.display.description,
            type: chanceInput.inputArgs.type,
        });
    }

    public hasCollectible(type: monopolypb.CollectibleExtra_CollectibleType) {
        return this.collectibles.some((collectible) => collectible.type === type);
    }

    /**
     * Pick out the collectible by removing from collection and return it.
     * @param id
     */
    public pickCollectible(id: string): Collectible | undefined {
        const collectible = this.collectibles.find((item) => item.id === id);
        this.collectibles = this.collectibles.filter((item) => item != collectible);
        return collectible;
    }

    /**
     * Pick out a collectible of type. This is used when an collectible
     * automatically become effective without player choosing, e.g.
     * get-out-of-jail card activates when going to jail
     */
    public consumeCollectible(
        type: monopolypb.CollectibleExtra_CollectibleType,
    ): Collectible | undefined {
        const collectible = this.collectibles.find((item) => item.type === type);
        this.collectibles = this.collectibles.filter((item) => item != collectible);
        return collectible;
    }
}
