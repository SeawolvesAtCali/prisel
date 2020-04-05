import { debug, Player, PlayerId, Request, Messages, Response } from '@prisel/server';
import Property, { toPropertyInfo } from './Property';
import { log } from './logGameObject';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import Game from './Game';
import PathNode from './PathNode';
import { RollResponsePayload, PurchaseResponsePayload, PurchasePayload } from '../common/messages';
import { PropertyInfo, Encounter } from '../common/types';
import { samePos } from './utils';

interface Props {
    id: PlayerId;
    player: Player;
    pathNode: PathNode;
    owning: Property[];
    cash: number;
    character: number;
    rolled: boolean;
}

export interface FlatPlayer extends FlatGameObject {
    position: Ref<PathNode>;
    owning: Array<Ref<Property>>;
    cash: number;
    rolled: boolean;
}

function roll(startingNode: PathNode): PathNode[] {
    const steps = Math.trunc(Math.random() * 6) + 1;
    debug(`player will move ${steps}`);
    return startingNode.genPath(steps);
}

export class GamePlayer extends GameObject {
    public pathNode: PathNode;
    public owning: Property[];
    public cash: number;
    public rolled: boolean;
    public player: Player;
    public character: number;

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.pathNode = props.pathNode;
        this.owning = props.owning || [];
        this.cash = props.cash;
        this.rolled = props.rolled;
        this.player = props.player;
        this.character = props.character;
    }

    @log
    private payRent(owner: GamePlayer, property: Property): PropertyInfo {
        this.cash = this.cash - property.rent;
        owner.gainMoney(property.rent);
        return toPropertyInfo(property);
    }

    @log
    public gainMoney(amount: number) {
        this.cash += amount;
    }

    @log
    public roll(game: Game, packet: Request): Response<RollResponsePayload> {
        if (this.rolled) {
            return Messages.getFailureFor(packet, `Player ${this.id} already rolled`);
        }

        const path = roll(this.pathNode);
        this.rolled = true;
        this.pathNode = path[path.length - 1];
        const { properties } = this.pathNode;
        const encounters: Encounter[] = [];
        if (properties.length > 0) {
            const payRentProperties: PropertyInfo[] = [];
            const propertiesForPurchase: PropertyInfo[] = [];
            // check for rent payment first
            for (const property of properties) {
                if (property.owner && property.owner.id !== this.id) {
                    payRentProperties.push(this.payRent(property.owner, property));
                }
                if (!property.owner) {
                    propertiesForPurchase.push(toPropertyInfo(property));
                }
            }
            if (payRentProperties.length > 0) {
                encounters.push({
                    payRent: {
                        properties: payRentProperties,
                        remainingMoney: this.cash,
                    },
                });
            }
            if (propertiesForPurchase.length > 0) {
                encounters.push({
                    newPropertyForPurchase: {
                        properties: propertiesForPurchase,
                    },
                });
            }
            // TODO when player doesn't have enough cash, declare bankrupcy
        }

        return Messages.getSuccessFor<RollResponsePayload>(packet, {
            path: path.map((pathNode) => pathNode.tile.pos),
            encounters,
        });
    }

    @log
    public purchase(
        game: Game,
        request: Request<PurchasePayload>,
    ): Response<PurchaseResponsePayload> {
        const { properties } = this.pathNode;
        const propertyToPurchase = properties.find((property) =>
            samePos(property.pos, request.payload.propertyPos),
        );

        if (!propertyToPurchase) {
            return Messages.getFailureFor(
                request,
                `no property at location ${request.payload.propertyPos}`,
            );
        }
        if (propertyToPurchase.owner) {
            return Messages.getFailureFor(request, 'property is already owned');
        }
        if (propertyToPurchase.cost > this.cash) {
            return Messages.getFailureFor(
                request,
                `not enough cash to purchase, current cash ${this.cash}, property price ${propertyToPurchase.cost}`,
            );
        }

        this.cash = this.cash - propertyToPurchase.cost;
        propertyToPurchase.setOwner(this);
        this.owning.push(propertyToPurchase);
        return Messages.getSuccessFor<PurchaseResponsePayload>(request, {
            property: toPropertyInfo(propertyToPurchase),
            remainingMoney: this.cash,
        });
    }

    @log
    public endTurn(game: Game, packet: Request): Response {
        if (this.rolled) {
            this.rolled = false;
            return Messages.getSuccessFor(packet);
        }
        // if not rolled, cannot end turn
        return Messages.getFailureFor(packet, 'Not rolled yet');
    }

    public flat(): FlatPlayer {
        return {
            id: this.id,
            position: this.ref(this.pathNode),
            owning: this.owning.map(this.ref),
            cash: this.cash,
            rolled: this.rolled,
        };
    }
}

export function create(props: Props): GamePlayer {
    return new GamePlayer(props);
}
