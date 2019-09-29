import { ClientId, Handle } from '@prisel/server';
import Property from './Property';
import Node from './Node';
import { log } from './logGameObject';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import Game from './Game';

interface Props {
    id: ClientId;
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

enum PlayerAction {
    ROLL,
    PURCHASE,
    ENDTURN,
}

const PlayerActionMap = {
    roll: PlayerAction.ROLL,
    purchase: PlayerAction.PURCHASE,
    endturn: PlayerAction.ENDTURN,
};

export default class Player extends GameObject {
    public position: Node;
    public owning: Property[];
    public cash: number;
    public rolled: boolean;

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.position = props.position;
        this.owning = props.owning || [];
        this.cash = props.cash;
        this.rolled = props.rolled;
    }

    public handleAction(type: string, game: Game) {
        const actionType: PlayerAction = (PlayerActionMap as any)[type];
        if (game.isCurrentPlayer(this)) {
            switch (actionType) {
                case PlayerAction.ROLL:
                    this.roll(game);
                    break;
                case PlayerAction.PURCHASE:
                    this.purchase(game);
                    break;
                case PlayerAction.ENDTURN:
                    this.endTurn(game);
                    break;
                default:
                // do nothing
            }
        }
    }

    @log
    private payRent(player: Player, amount: number): number {
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
    public roll(game: Game): void {
        if (!this.rolled) {
            const steps = roll();
            this.rolled = true;
            const path = this.position.genPath(steps);
            this.position = path[path.length - 1];
            const { property } = this.position;
            if (property) {
                this.handle.log('there is a property %O', property.flat());
                if (property.owner && property.owner.id !== this.id) {
                    this.payRent(property.owner, property.rent);
                }
                if (!property.owner) {
                    this.handle.log('can purchase this property for ' + property.price);
                }
            }
            this.handle.emit(this.id, {
                type: 'move',
                payload: {
                    steps,
                },
            });
        }
    }

    @log
    public purchase(game: Game): void {
        const { property } = this.position;
        if (property && !property.owner && property.price <= this.cash) {
            this.cash = this.cash - property.price;
            property.setOwner(this);
            this.owning.push(property);
        }
    }

    @log
    public endTurn(game: Game): void {
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

export function create(props: Props, handle: Handle): Player {
    const player = new Player(props);
    player.setHandle(handle);
    return player;
}
