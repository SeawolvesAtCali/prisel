import { debug, Player, PlayerId, Request } from '@prisel/server';
import Property from './Property';
import Node from './Node';
import { log } from './logGameObject';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import Game from './Game';
import { RollReponsePayload } from './messages';

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
    public roll(game: Game, packet: Request): void {
        if (!this.rolled) {
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

            this.player.respond<RollReponsePayload>(packet, {
                steps,
            });
            // TODO notify other players
        }
    }

    @log
    public purchase(game: Game, packet: Request): void {
        const { property } = this.position;
        if (property && !property.owner && property.price <= this.cash) {
            this.cash = this.cash - property.price;
            property.setOwner(this);
            this.owning.push(property);
        }
    }

    @log
    public endTurn(game: Game, packet: Request): void {
        if (this.rolled) {
            // if not rolled, cannot end turn
            this.rolled = true;
            game.giveTurnToNext();
            // TODO: notify next player
        }
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
