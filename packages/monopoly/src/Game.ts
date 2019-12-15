import Player from './Player';
import { ClientId, Handle } from '@prisel/server';
import GameObject, { FlatGameObject, Ref } from './GameObject';
import Node from './Node';
import { flattenState } from './state';
import { log } from './logGameObject';
import { Payload, isPayload } from '@prisel/common';
import { Messages } from '@prisel/server';

interface Props {
    id: string;
    players: Map<ClientId, Player>;
    turnOrder: Player[];
    map: Node;
}

interface FlatGame extends FlatGameObject {
    players: { [playerId: string]: Ref<Player> };
    turnOrder: Array<Ref<Player>>;
    map: Ref<Node>;
}

interface GamePayload {
    type: string;
}

export function isGamePayload(arg: any): arg is GamePayload {
    return arg && typeof arg.type === 'string';
}

export default class Game extends GameObject {
    public id: string;
    public players: Map<string, Player>;
    public turnOrder: Player[];
    public map: Node;
    private handleMap: Map<string, (handle: Handle, playerId: ClientId, data: GamePayload) => void>;

    constructor(props: Props) {
        super();
        this.id = props.id;
        this.players = props.players;
        this.turnOrder = props.turnOrder;
        this.map = props.map;
        this.handleMap = new Map();
        this.setupHandlers();
    }

    private setupHandlers() {
        this.handleMap.set('get_game_state', this.onGetGameState);
        this.handleMap.set('debug', this.debug);
        this.handleMap.set('roll', this.roll);
        this.handleMap.set('purchase', this.purchase);
        this.handleMap.set('end_turn', this.endTurn);
        this.handleMap.set('finished_setup', this.onFinishedSetup);
    }

    public processMessage(handle: Handle, playerId: ClientId, data: GamePayload) {
        if (this.handleMap.has(data.type)) {
            this.handleMap.get(data.type).call(this, handle, playerId, data);
        }

        const player = this.players.get(playerId);
        if (player && typeof data.type === 'string') {
            player.handleAction(data.type, this);
        }
    }

    private onGetGameState(handle: Handle, playerId: ClientId, data: GamePayload) {
        const flatState = flattenState(this);
        handle.log('initial game state: \n%O', flatState);
        handle.emit(
            playerId,
            ...Messages.getMessage({
                request: 'get_game_state',
                state: flatState,
            }),
        );
    }

    private onFinishedSetup(handle: Handle, playerId: ClientId, data: GamePayload) {
        const gameState = handle.setState<GameState>((state) => {
            state.finishedSetup = state.finishedSetup || {};
            state.finishedSetup[playerId] = true;
        });
        if (Object.keys(gameState.finishedSetup).length === handle.players.length) {
            handle.log('everyone finished setup, lets start the game');
            handle.setState<GameState>((state) => {
                state.playerOrders = handle.players.slice();
            });
            this.requestStartTurn(handle);
        }
    }

    private requestStartTurn(handle: Handle) {
        const currentPlayer = handle.state.playerOrders[0];
        handle.broadcast(handle.players, {
            type: 'start_turn',
            player: currentPlayer,
        });
    }

    private debug(handle: Handle, playerId: ClientId, data: GamePayload) {
        const flatState = flattenState(this);
        handle.emit(playerId, flatState);
        handle.log('current game state is: \n%O', flatState);
    }

    private roll(handle: Handle, playerId: ClientId, data: GamePayload) {
        const player = this.players.get(playerId);
        if (this.isCurrentPlayer(player)) {
            player.roll(this);
        }
    }

    private purchase(handle: Handle, playerId: ClientId, data: GamePayload) {
        const player = this.players.get(playerId);
        if (this.isCurrentPlayer(player)) {
            player.purchase(this);
        }
    }

    private endTurn(handle: Handle, playerId: ClientId, data: GamePayload) {
        const player = this.players.get(playerId);
        if (this.isCurrentPlayer(player)) {
            player.endTurn(this);
        }
    }

    @log
    public giveTurnToNext(): void {
        this.turnOrder = [...this.turnOrder.slice(1), this.turnOrder[0]];
    }

    public isCurrentPlayer(player: Player) {
        return this.turnOrder[0] === player;
    }

    public flat(): FlatGame {
        const players: { [playerId: string]: Ref<Player> } = {};
        this.players.forEach((player, key) => {
            players[key] = this.ref(player);
        });
        return {
            id: this.id,
            players,
            map: this.ref(this.map),
            turnOrder: this.turnOrder.map(this.ref),
        };
    }
}

export function create(props: Props, handle: Handle) {
    const game = new Game(props);
    game.setHandle(handle);
    return game;
}

interface GameState {
    finishedSetup: { [clientId: string]: boolean };
    playerOrders: string[];
}
