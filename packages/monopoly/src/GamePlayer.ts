import { debug, Player, PlayerId, Request, Messages, Response } from '@prisel/server';
import Property from './Property';
import Node from './Node';
import { log } from './logGameObject';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import Game from './Game';
import { RollResponsePayload, PurchaseResponsePayload } from '../common/messages';

interface Props {
    id: PlayerId;
    player: Player;
    position: Node;
    owning: Property[];
    cash: number;
    rolled: boolean;
}

export interface FlatPlayer extends FlatGameObject {
    position: Ref<Node>;
    owning: Array<Ref<Property>>;
    cash: number;
    rolled: boolean;
}

function roll() {
    return Math.trunc(Math.random() * 6) + 1;
}

export class GamePlayer extends GameObject {
    public position: Node;
    public owning: Property[];
    public cash: number;
    public rolled: boolean;
    public player: Player;

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.position = props.position;
        this.owning = props.owning || [];
        this.cash = props.cash;
        this.rolled = props.rolled;
        this.player = props.player;
    }

    @log
    private payRent(player: GamePlayer, amount: number): number {
        const paid = Math.min(this.cash, amount);
        this.cash -= paid;
        player.gainMoney(paid);
        return paid;
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

        const steps = roll();
        this.rolled = true;
        const path = this.position.genPath(steps);
        this.position = path[path.length - 1];
        const { property } = this.position;
        if (property) {
            debug('there is a property %O', property.flat());
            if (property.owner && property.owner.id !== this.id) {
                this.payRent(property.owner, property.rent);
            }
            if (!property.owner) {
                debug('can purchase this property for ' + property.price);
            }
        }

        return Messages.getSuccessFor<RollResponsePayload>(packet, {
            steps,
        });
    }

    @log
    public purchase(game: Game, packet: Request): Response<PurchaseResponsePayload> {
        const { property } = this.position;
        if (!property) {
            return Messages.getFailureFor(packet, `no property at location ${this.position.id}`);
        }
        if (property.owner) {
            return Messages.getFailureFor(packet, 'property is already owned');
        }
        if (property.price > this.cash) {
            return Messages.getFailureFor(
                packet,
                `not enough cash to purchase, current cash ${this.cash}, property price ${property.price}`,
            );
        }

        this.cash = this.cash - property.price;
        property.setOwner(this);
        this.owning.push(property);
        return Messages.getSuccessFor<PurchaseResponsePayload>(packet, {
            property: {
                id: property.id,
                cost: property.price,
                rent: property.rent,
                name: property.name,
            },
            remaining_cash: this.cash,
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
            position: this.ref(this.position),
            owning: this.owning.map(this.ref),
            cash: this.cash,
            rolled: this.rolled,
        };
    }
}

export function create(props: Props): GamePlayer {
    return new GamePlayer(props);
}
