import MapLoader from './MapLoader';
import {
    BoardSetup,
    Action,
    InitialStatePayload,
    GamePlayerInfo,
    PurchasePayload,
    PlayerStartTurnPayload,
    PlayerRollPayload,
    PlayerPurchasePayload,
    PlayerEndTurnPayload,
    RollResponsePayload,
} from './packages/monopolyCommon';
import { client, ClientState } from './Client';
import { Client, Packet, PacketType, ResponseWrapper } from './packages/priselClient';
import Player from './Player';
import Tile from './Tile';
import {
    CHARACTER_COLORS,
    FLIP_THRESHHOLD,
    AUTO_PANNING_PX_PER_SECOND,
    EVENT_BUS,
    EVENT,
} from './consts';
import Pannable from './Pannable';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property
    private mapJsonPath = '';

    @property(cc.Prefab)
    private playerPrefab: cc.Prefab = null;

    @property(cc.Button)
    private rollButton: cc.Button = null;

    @property(cc.Button)
    private purchaseButton: cc.Button = null;

    @property(cc.Button)
    private endTurnButton: cc.Button = null;

    @property(cc.Node)
    private mapNode: cc.Node = null;

    @property(cc.Node)
    private mapUiPannable: cc.Node = null;

    private funcWaitingForStart: Array<() => void> = [];
    private started = false;
    private client: Client<ClientState> = null;
    private offPacketListeners: Array<() => void> = [];
    private map: MapLoader = null;
    private playerNodes: cc.Node[] = [];

    private eventBus: cc.Node = null;
    private rollPromise: Promise<void> = null;

    protected onLoad() {
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

    private setupGame(boardSetup: BoardSetup) {
        this.map = this.mapNode.getComponent(MapLoader);
        this.map.renderMap(boardSetup);
        this.mapUiPannable
            .getComponent(Pannable)
            .setSize(this.map.mapWidthInPx, this.map.mapHeightInPx);

        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_START_TURN, this.handleAnnounceStartTurn.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_ROLL, this.handleAnnounceRoll.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_PURCHASE, this.handleAnnouncePurchase.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_PAY_RENT, this.handleAnnouncePayRent.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_END_TURN, this.handleAnnounceEndTurn.bind(this)),
        );

        const startTiles = this.map.getStartTiles();
        cc.log('start tiles are ', startTiles);
        this.client
            .request({
                type: PacketType.REQUEST,
                request_id: this.client.newId(),
                action: Action.GET_INITIAL_STATE,
                payload: {},
            })
            .then((response: ResponseWrapper<InitialStatePayload>) => {
                for (const gamePlayer of response.payload.gamePlayers) {
                    this.playerNodes.push(this.instantiatePlayer(gamePlayer));
                }
                // TODO pan to current player
                this.panToPlayer(response.payload.firstPlayerId);
                this.prepareForNextTurn();
            });
    }

    private prepareForNextTurn() {
        this.rollPromise = null;
        this.client.emit({
            type: PacketType.DEFAULT,
            action: Action.READY_TO_START_TURN,
            payload: {},
        });
    }

    private panToPlayer(id: string): Promise<void> {
        const playerNode = this.getPlayerNode(id);
        const pannableControllerNode = this.mapUiPannable.parent;
        const playerInPannableControllerPositionV3 = pannableControllerNode.convertToNodeSpaceAR(
            playerNode.convertToWorldSpaceAR(cc.v2(), cc.v2()),
        );
        const playerInPannableControllerPosition = cc.v2(
            playerInPannableControllerPositionV3.x,
            playerInPannableControllerPositionV3.y,
        );

        const containerCenter = cc
            .v2(0.5, 0.5)
            .sub(pannableControllerNode.getAnchorPoint())
            .scale(cc.v2(pannableControllerNode.width, pannableControllerNode.height));
        const moveBy = containerCenter.sub(playerInPannableControllerPosition);

        const moveDistance = moveBy.mag();
        const moveToPosition = moveBy.add(this.mapUiPannable.position);

        return new Promise((resolve) => {
            cc.tween(this.mapUiPannable)
                .to(
                    moveDistance / AUTO_PANNING_PX_PER_SECOND,
                    {
                        position: moveToPosition,
                    },
                    { easing: 'sineInOut' },
                )
                .call(resolve)
                .start();
        });
    }

    private handleAnnounceStartTurn(packet: Packet<PlayerStartTurnPayload>) {
        const isCurrentPlayerTurn = packet.payload.id === this.client.state.id;
        if (isCurrentPlayerTurn) {
            this.eventBus.emit(EVENT.START_CURRENT_PLAYER_TURN);
            this.rollButton.node.active = isCurrentPlayerTurn;
            this.purchaseButton.node.active = isCurrentPlayerTurn;
            this.endTurnButton.node.active = isCurrentPlayerTurn;
        }
    }

    private getPlayerNode(id: string): cc.Node {
        return this.playerNodes.find((node) => node.getComponent(Player).getId() === id);
    }

    private async handleAnnounceRoll(packet: Packet<PlayerRollPayload>) {
        if (this.rollPromise) {
            await this.rollPromise;
        }
        this.rollPromise = null;

        const { id, path } = packet.payload;
        const playerNode = this.getPlayerNode(id);
        const playerComponent = playerNode.getComponent(Player);
        playerComponent.walk();
        this.map.moveAlongPath(
            playerNode,
            path,
            (node, target: cc.Vec2) => {
                const playerComp = node.getComponent(Player);
                if (target.x - node.position.x > FLIP_THRESHHOLD) {
                    playerComp.turnToRight();
                }
                if (node.position.x - target.x > FLIP_THRESHHOLD) {
                    playerComp.turnToLeft();
                }
            },
            () => playerComponent.stop(),
        );
    }

    private handleAnnouncePurchase(packet: Packet<PlayerPurchasePayload>) {
        const { property: purchasdProperty, id } = packet.payload;
        const player = this.playerNodes.find(
            (playerNode) => playerNode.getComponent(Player).getId() === id,
        );

        this.map.getPropertyTileAt(purchasdProperty.pos).setOwner(player.getComponent(Player));
    }

    private handleAnnouncePayRent() {}

    private handleAnnounceEndTurn(packet: Packet<PlayerEndTurnPayload>) {
        const isCurrentPlayerTurn = packet.payload.currentPlayerId === this.client.state.id;
        if (isCurrentPlayerTurn) {
            this.eventBus.emit(EVENT.END_CURRENT_PLAYER_TURN);
        }
        // pan to the next player
        this.panToPlayer(packet.payload.nextPlayerId);

        this.prepareForNextTurn();
    }

    private requestRoll() {
        cc.log('request Roll');
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
        this.rollPromise = new Promise((resolve) => {
            this.eventBus.on(EVENT.DICE_ROLLED_END, resolve);
        });
    }

    private requestEndTurn() {
        this.client
            .request({
                type: PacketType.REQUEST,
                request_id: this.client.newId(),
                action: Action.END_TURN,
                payload: {},
            })
            .then((response: ResponseWrapper) => {
                if (response.ok()) {
                    this.rollButton.node.active = false;
                    this.purchaseButton.node.active = false;
                    this.endTurnButton.node.active = false;
                }
            });
    }

    private requestPurchase() {
        const selectedPropertyTile = this.map.selectedPropertyTile;
        if (selectedPropertyTile) {
            this.client.request<PurchasePayload>({
                type: PacketType.REQUEST,
                request_id: this.client.newId(),
                action: Action.PURCHASE,
                payload: {
                    propertyPos: selectedPropertyTile.getComponent(Tile).getTile().pos,
                },
            });
        }
    }

    private instantiatePlayer(gamePlayer: GamePlayerInfo): cc.Node {
        const playerNode = this.map.addToMap(cc.instantiate(this.playerPrefab), gamePlayer.pos);
        const playerComponent = playerNode.getComponent(Player);
        playerComponent.init(gamePlayer.player, CHARACTER_COLORS[gamePlayer.character]);
        return playerNode;
    }

    private waitForStart(callback: () => void) {
        if (this.started) {
            callback();
        } else {
            this.funcWaitingForStart.push(callback);
        }
    }

    protected start() {
        this.started = true;
        this.eventBus = cc.find(EVENT_BUS);
        cc.log('event bus', this.eventBus);
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

        this.rollButton.node.on('click', this.requestRoll, this);
        this.purchaseButton.node.on('click', this.requestPurchase, this);
        this.endTurnButton.node.on('click', this.requestEndTurn, this);
    }

    protected onDestroy() {
        for (const offListener of this.offPacketListeners) {
            offListener();
        }
        this.offPacketListeners = [];
    }

    // update (dt) {}
}
