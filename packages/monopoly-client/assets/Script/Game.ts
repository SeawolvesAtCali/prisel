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
} from './packages/monopolyCommon';
import { client, ClientState } from './Client';
import { Client, Packet, PacketType, ResponseWrapper } from './packages/priselClient';
import Player from './Player';
import Tile from './Tile';
import { CHARACTER_COLORS, FLIP_THRESHHOLD } from './consts';

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

    private funcWaitingForStart: Array<() => void> = [];
    private started = false;
    private client: Client<ClientState> = null;
    private offPacketListeners: Array<() => void> = [];
    private map: MapLoader = null;
    private playerNodes: cc.Node[] = [];

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
        this.map = this.node.getComponentInChildren(MapLoader);
        this.map.renderMap(boardSetup);
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_START_TURN, this.handleAnnounceStartTurn.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_ROLL, this.handleAnnouncRoll.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_PURCHASE, this.handleAnnouncPurchase.bind(this)),
        );
        this.offPacketListeners.push(
            this.client.on(Action.ANNOUNCE_PAY_RENT, this.handleAnnouncePayRent.bind(this)),
        );

        const startTiles = this.map.getStartTiles();
        cc.log('start tiles are ', startTiles);
        const offInitialStateListener = this.client.on(
            Action.INITIAL_STATE,
            (packet: Packet<InitialStatePayload>) => {
                const { gamePlayers } = packet.payload;
                for (const gamePlayer of gamePlayers) {
                    this.playerNodes.push(this.instantiatePlayer(gamePlayer));
                }
                offInitialStateListener();
            },
        );
        this.client.emit<Packet>({
            type: PacketType.DEFAULT,
            action: Action.SETUP_FINISHED,
        });
    }

    private handleAnnounceStartTurn(packet: Packet<PlayerStartTurnPayload>) {
        const isCurrentPlayerTurn = packet.payload.id === this.client.state.id;

        this.rollButton.node.active = isCurrentPlayerTurn;
        this.purchaseButton.node.active = isCurrentPlayerTurn;
        this.endTurnButton.node.active = isCurrentPlayerTurn;
    }

    private handleAnnouncRoll(packet: Packet<PlayerRollPayload>) {
        const { id, path } = packet.payload;
        const playerNode = this.playerNodes.find(
            (node) => node.getComponent(Player).getId() === id,
        );
        const playerComponent = playerNode.getComponent(Player);
        playerComponent.walk();
        this.map.moveAlongPath(
            playerNode,
            path,
            (node, target: cc.Vec2) => {
                if (target.x - node.position.x > FLIP_THRESHHOLD) {
                    node.setScale(1, 1);
                }
                if (node.position.x - target.x > FLIP_THRESHHOLD) {
                    // moving left, flip sprite
                    node.setScale(-1, 1);
                }
            },
            () => playerComponent.stop(),
        );
    }

    private handleAnnouncPurchase(packet: Packet<PlayerPurchasePayload>) {
        const { property: purchasdProperty, id } = packet.payload;
        const player = this.playerNodes.find(
            (playerNode) => playerNode.getComponent(Player).getId() === id,
        );

        this.map.getPropertyTileAt(purchasdProperty.pos).setOwner(player.getComponent(Player));
    }

    private handleAnnouncePayRent() {}

    private requestRoll() {
        cc.log('request Roll');
        this.client.request({
            type: PacketType.REQUEST,
            request_id: this.client.newId(),
            action: Action.ROLL,
            payload: {},
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
