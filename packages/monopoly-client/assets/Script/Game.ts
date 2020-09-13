import { Client, Messages, Packet, PacketType, Request, ResponseWrapper } from '@prisel/client';
import {
    Action,
    BoardSetup,
    GameOverPayload,
    GamePlayerInfo,
    InitialStatePayload,
    PlayerBankruptPayload,
    PlayerEndTurnPayload,
    PlayerLeftPayload,
    PlayerPayRentPayload,
    PlayerPurchasePayload,
    PlayerRollPayload,
    PlayerStartTurnPayload,
    PromptPurchasePayload,
    PromptPurchaseResponsePayload,
    PropertyClass,
    RollResponsePayload,
    TileClass,
    World,
} from '@prisel/monopoly-common';
import { client, ClientState } from './Client';
import { CHARACTER_COLORS, EVENT, EVENT_BUS } from './consts';
import MapLoader from './MapLoader';
import Player from './Player';
import { lifecycle, nullCheck } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property
    private mapJsonPath = '';

    @property(cc.Prefab)
    private playerPrefab: cc.Prefab = null;

    @property(cc.Node)
    private mapNode: cc.Node = null;

    private funcWaitingForStart: Array<() => void> = [];
    private started = false;
    private client: Client<ClientState> = null;
    private offPacketListeners: Array<() => void> = [];
    private map: MapLoader = null;
    private playerNodes: cc.Node[] = [];

    public world: World = null;

    private eventBus: cc.Node = null;

    private static instance: Game = null;

    public static get() {
        return Game.instance;
    }

    @lifecycle
    protected onLoad() {
        Game.instance = this;
        this.client = client;
        // load map data
        if (this.mapJsonPath) {
            cc.loader.loadRes(this.mapJsonPath, cc.JsonAsset, (err, json) => {
                if (err) {
                    cc.log('err loading map' + err);
                    return;
                }
                this.waitForStart(() => this.setupGame(json.json as BoardSetup));
            });
            return;
        }
        cc.log('mapJsonPath is empty ' + this.mapJsonPath);
    }

    private async setupGame(boardSetup: BoardSetup) {
        this.world = new World()
            .registerObject(TileClass)
            .registerObject(PropertyClass)
            .deserialize(boardSetup.world);
        this.map = this.mapNode.getComponent(MapLoader);
        this.map.renderMap(this.world, boardSetup);

        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_START_TURN, this.handleAnnounceStartTurn.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_ROLL, this.handleAnnounceRoll.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_PAY_RENT, this.handleAnnouncePayRent.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.PROMPT_PURCHASE, this.handlePurchasePrompt.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_PURCHASE, this.handleAnnouncePurchase.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_END_TURN, this.handleAnnounceEndTurn.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_BANKRUPT, this.handleAnnounceBankrupt.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_GAME_OVER, this.handleAnnounceGameOver.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_PLAYER_LEFT, this.handleAnnounceLeft.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(
                Action.PROMPT_CHANCE_CONFIRMATION,
                this.handleChanceConfirmationPrompt.bind(this),
            ),
        );

        const response: ResponseWrapper<InitialStatePayload> = await this.client.request({
            type: PacketType.REQUEST,
            request_id: this.client.newId(),
            action: Action.GET_INITIAL_STATE,
            payload: {},
        });

        // CHARACTER_COLORS[gamePlayer.character]
        for (const gamePlayer of response.payload.gamePlayers) {
            if (gamePlayer.player.id === this.client.state.id) {
                this.eventBus.emit(EVENT.UPDATE_MY_GAME_PLAYER_INFO, gamePlayer);
            }
            const newPlayer = this.instantiatePlayer(gamePlayer);
            this.playerNodes.push(newPlayer);
        }

        this.client.emit<Packet>({
            type: PacketType.DEFAULT,
            action: Action.READY_TO_START_GAME,
            payload: {},
        });
    }

    private handleAnnounceStartTurn(packet: Packet<PlayerStartTurnPayload>) {
        const isCurrentPlayerTurn = packet.payload.id === this.client.state.id;
        if (isCurrentPlayerTurn) {
            this.eventBus.emit(EVENT.START_CURRENT_PLAYER_TURN);
        }
    }

    public getPlayerNodes(): cc.Node[] {
        return this.playerNodes;
    }
    public getPlayerNode(id: string): cc.Node {
        return this.getPlayerNodes().find((node) => node.getComponent(Player).getId() === id);
    }

    private async handleAnnounceRoll(packet: Packet<PlayerRollPayload>) {
        const { id } = packet.payload;

        const playerNode = this.getPlayerNode(id);
        const playerComponent = playerNode.getComponent(Player);
        playerComponent.pos = packet.payload.path.slice(-1)[0];
    }

    private handleAnnouncePayRent(packet: Packet<PlayerPayRentPayload>) {
        this.eventBus.emit(EVENT.UPDATE_MY_MONEY, packet.payload.myCurrentMoney);
    }

    private async handlePurchasePrompt(packet: Request<PromptPurchasePayload>) {
        this.eventBus.emit(EVENT.PROMPT_PURCHASE, packet.payload);
        const purchase = await new Promise<boolean>((resolve) => {
            this.eventBus.once(EVENT.PURCHASE_DECISION, resolve);
        });
        cc.log('purchase decision ' + purchase);

        this.client.respond<PromptPurchaseResponsePayload>(packet, {
            purchase: !!purchase,
        });
        if (purchase) {
            this.eventBus.emit(EVENT.UPDATE_MY_MONEY, packet.payload.moneyAfterPurchase);
        }
    }

    private async handleChanceConfirmationPrompt(packet: Request) {
        await new Promise((resolve) => this.eventBus.once(EVENT.CONFIRM_CHANCE, resolve));
        // TODO if user doesn't click on the chance to dismiss it. It will be
        // dismissed after 10 seconds. We will still have this promise, which
        // is a memory leak

        this.client.respond(packet, {});
    }

    private handleAnnouncePurchase(packet: Packet<PlayerPurchasePayload>) {
        const { property: purchasedProperty, id } = packet.payload;
        const player = this.playerNodes
            .find((playerNode) => playerNode.getComponent(Player).getId() === id)
            .getComponent(Player);
        const property = this.map.getPropertyTileAt(purchasedProperty.pos);
        property.setOwner(player, purchasedProperty);
    }

    private handleAnnounceEndTurn(packet: Packet<PlayerEndTurnPayload>) {
        const isCurrentPlayerTurn = packet.payload.currentPlayerId === this.client.state.id;
        if (isCurrentPlayerTurn) {
            this.eventBus.emit(EVENT.END_CURRENT_PLAYER_TURN);
        }

        this.eventBus.emit(EVENT.NO_MORE_PACKET_FROM_SERVER_FOR_CURRENT_TURN);
    }

    private handleAnnounceBankrupt(packet: Packet<PlayerBankruptPayload>) {
        cc.log('player bankrupted ' + packet.payload.id);
    }

    private async handleAnnounceGameOver(packet: Packet<GameOverPayload>) {
        cc.log('game over ', packet.payload);
        this.eventBus.emit(EVENT.SHOW_RANKING, packet.payload.ranks);
        await new Promise((resolve) => {
            this.eventBus.once(EVENT.RANKING_CLOSED, resolve);
        });
        const response = await this.client.request({
            type: PacketType.REQUEST,
            request_id: this.client.newId(),
            action: Action.BACK_TO_ROOM,
            payload: {},
        });
        if (response.ok()) {
            cc.director.loadScene('room');
        } else {
            cc.log(response.getMessage());
        }
    }

    private handleAnnounceLeft(packet: Packet<PlayerLeftPayload>) {
        cc.log('player left', packet);
    }

    private requestRoll() {
        this.client
            .request({
                type: PacketType.REQUEST,
                request_id: this.client.newId(),
                action: Action.ROLL,
                payload: {},
            })
            .then((response: ResponseWrapper<RollResponsePayload>) => {
                if (response.ok()) {
                    this.eventBus.emit(EVENT.DICE_ROLLED_RESPONSE, response.payload.steps);
                }
            });
    }

    private instantiatePlayer(gamePlayer: GamePlayerInfo): cc.Node {
        const playerNode = this.map.addToMap(cc.instantiate(this.playerPrefab), gamePlayer.pos);
        const playerComponent = playerNode.getComponent(Player);
        playerComponent.init(
            gamePlayer.player,
            CHARACTER_COLORS[gamePlayer.character],
            gamePlayer.pos,
        );
        return playerNode;
    }

    private waitForStart(callback: () => void) {
        if (this.started) {
            callback();
        } else {
            this.funcWaitingForStart.push(callback);
        }
    }

    private async onLeave() {
        const response = await this.client.request(Messages.getLeave(this.client.newId()));
        if (response.ok()) {
            cc.director.loadScene('lobby');
        }
    }

    @lifecycle
    protected start() {
        this.started = true;
        this.eventBus = nullCheck(cc.find(EVENT_BUS));
        const debugNode = this.node.getChildByName('debug');
        if (debugNode) {
            this.node.removeChild(debugNode);
        }
        if (this.funcWaitingForStart.length > 0) {
            for (const func of this.funcWaitingForStart) {
                func();
            }
        }
        this.funcWaitingForStart = [];

        this.eventBus.on(EVENT.DICE_ROLLED, this.requestRoll, this);
        this.eventBus.on(EVENT.LEAVE_ROOM, this.onLeave, this);
    }

    @lifecycle
    protected onDestroy() {
        Game.instance = undefined;
        for (const offListener of this.offPacketListeners) {
            offListener();
        }
        this.offPacketListeners = [];
    }
}
