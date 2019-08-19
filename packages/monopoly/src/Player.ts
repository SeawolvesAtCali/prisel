import { ClientId, Handle } from '@prisel/server';
import Property from './Property';
import Node from './Node';
import { log } from './logGameObject';
import GameObject, { FlatGameObject, Ref, IGameObject } from './GameObject';
import Game from './Game';

interface PlayerProps extends IGameObject {
    id: ClientId;
    position: Node;
    owning: Property[];
    cash: number;
    rolled: boolean;
}

interface FlatPlayer extends FlatGameObject {
    position: Ref<Node>;
    owning: Array<Ref<Property>>;
    cash: number;
    rolled: boolean;
}

function roll() {
    return Math.trunc(Math.random() * 6) + 1;
}

export default interface Player extends PlayerProps {
    handleAction(type: string, game: Game): void;
    roll(game: Game): void;
    purchase(game: Game): void;
    endTurn(game: Game): void;
    gainMoney(amount: number): void;
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

class PlayerImpl extends GameObject implements Player {
    public position: Node;
    public owning: Property[];
    public cash: number;
    public rolled: boolean;

    constructor(props: PlayerProps) {
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
                if (property.owner && property.owner.id !== this.id) {
                    this.payRent(property.owner, property.rent);
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

export function create(props: PlayerProps, handle: Handle): Player {
    const player = new PlayerImpl(props);
    player.setHandle(handle);
    return player;
}
