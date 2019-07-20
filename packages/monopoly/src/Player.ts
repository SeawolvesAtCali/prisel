import { ClientId, Handle } from '@prisel/server';
import Property from './Property';
import Node from './Node';
import GameObject from './GameObject';
import Game from './Game';

export enum PlayerPhase {
    WAITING, // Not player's turn yet or Player hasn't roll dice yet.
    ROLLED, // Player rolled a dice, maybe waiting for other action
}

interface PlayerProps {
    id: ClientId;
    position?: Node;
    owning: Property[];
    cash: number;
    phase: PlayerPhase;
}

function roll() {
    return Math.trunc(Math.random() * 6) + 1;
}

export default interface Player extends PlayerProps {
    handleAction(type: string, game: Game): void;
    roll(game: Game): void;
    purchase(game: Game): void;
    endTurn(game: Game): void;
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
    public position?: Node;
    public owning: Property[];
    public cash: number;
    public phase: PlayerPhase;

    constructor(props: PlayerProps) {
        super();

        this.id = props.id;
        this.position = props.position;
        this.owning = props.owning;
        this.cash = props.cash;
        this.phase = props.phase;
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

    private payRent(player: Player, amount: number): number {
        const paid = Math.min(this.cash, amount);
        this.cash -= paid;
        player.cash += paid;
        return paid;
    }

    public roll(game: Game): void {
        if (this.phase === PlayerPhase.WAITING) {
            const steps = roll();
            this.phase = PlayerPhase.ROLLED;
            const path = this.position.genPath(steps);
            this.position = path[path.length - 1];
            const { property } = this.position;
            if (property) {
                if (property.owner.id !== this.id) {
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

    public purchase(game: Game): void {
        const { property } = this.position;
        if (property && !property.owner && property.price <= this.cash) {
            this.cash = this.cash - property.price;
            property.owner = this;
            this.owning.push(property);
        }
    }

    public endTurn(game: Game): void {
        if (this.phase === PlayerPhase.ROLLED) {
            // if not rolled, cannot end turn
            this.phase = PlayerPhase.WAITING;
            game.giveTurnToNext();
            // TODO: notify next player
        }
    }
}

export function create(props: PlayerProps, handle: Handle): Player {
    const player = new PlayerImpl(props);
    player.setHandle(handle);
    return player;
}
