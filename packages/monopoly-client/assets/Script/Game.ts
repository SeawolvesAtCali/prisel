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
    PurchaseResponsePayload,
    Encounter,
    PropertyForPurchaseEncounter,
} from './packages/monopolyCommon';
import { client, ClientState } from './Client';
import { Client, Packet, PacketType, ResponseWrapper } from './packages/priselClient';
import Player from './Player';
import Tile from './Tile';
import { CHARACTER_COLORS, FLIP_THRESHHOLD, EVENT_BUS, EVENT, GAME_CAMERA } from './consts';
import GameCameraControl from './GameCameraControl';

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
    private myPlayer: GamePlayerInfo = null;

    private eventBus: cc.Node = null;
    private rollAnimationPromise: Promise<void> = null;
    private gameCamera: cc.Node = null;

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

        this.client
            .request({
                type: PacketType.REQUEST,
                request_id: this.client.newId(),
                action: Action.GET_INITIAL_STATE,
                payload: {},
            })
            .then((response: ResponseWrapper<InitialStatePayload>) => {
                // CHARACTER_COLORS[gamePlayer.character]
                for (const gamePlayer of response.payload.gamePlayers) {
                    if (gamePlayer.player.id === this.client.state.id) {
                        this.myPlayer = gamePlayer;
                        this.eventBus.emit(EVENT.UPDATE_MY_GAME_PLAYER_INFO, gamePlayer);
                    }
                    this.playerNodes.push(this.instantiatePlayer(gamePlayer));
                }
                this.panToPlayer(response.payload.firstPlayerId).then(() => {
                    this.prepareForNextTurn();
                });
            });
    }

    private prepareForNextTurn() {
        this.rollAnimationPromise = null;
        this.client.emit({
            type: PacketType.DEFAULT,
            action: Action.READY_TO_START_TURN,
            payload: {},
        });
    }

    private panToPlayer(id: string): Promise<void> {
        const playerNode = this.getPlayerNode(id);
        return this.gameCamera.getComponent(GameCameraControl).moveToNode(playerNode);
    }

    private handleAnnounceStartTurn(packet: Packet<PlayerStartTurnPayload>) {
        const isCurrentPlayerTurn = packet.payload.id === this.client.state.id;
        if (isCurrentPlayerTurn) {
            this.eventBus.emit(EVENT.START_CURRENT_PLAYER_TURN);
        }
    }

    private getPlayerNode(id: string): cc.Node {
        return this.playerNodes.find((node) => node.getComponent(Player).getId() === id);
    }

    private async handleAnnounceRoll(packet: Packet<PlayerRollPayload>) {
        if (this.rollAnimationPromise) {
            await this.rollAnimationPromise;
        }
        this.rollAnimationPromise = null;

        const { id, path } = packet.payload;
        const playerNode = this.getPlayerNode(id);
        const playerComponent = playerNode.getComponent(Player);
        playerComponent.walk();
        const gameCameraControl = this.gameCamera.getComponent(GameCameraControl);
        gameCameraControl.startFollowing(playerNode);
        await this.map.moveAlongPath(playerNode, path, (node, target: cc.Vec2) => {
            const playerComp = node.getComponent(Player);
            if (target.x - node.position.x > FLIP_THRESHHOLD) {
                playerComp.turnToRight();
            }
            if (node.position.x - target.x > FLIP_THRESHHOLD) {
                playerComp.turnToLeft();
            }
        });
        playerComponent.stop();
        gameCameraControl.stopFollowing();
        if (id === this.client.state.id) {
            // it's my player
            await this.handleEncounters(packet.payload.encounters);
            this.requestEndTurn();
        }
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
        this.panToPlayer(packet.payload.nextPlayerId).then(() => {
            this.prepareForNextTurn();
        });
    }

    private handleEncounters(encounters: Encounter[]): Promise<void> {
        return new Promise((resolve) => {
            const handlePurchase = (propertyForPurchase: PropertyForPurchaseEncounter) => {
                waitingCount--;
                cc.log('purchasing');
                this.requestPurchase(propertyForPurchase);
                if (waitingCount === 0) {
                    this.eventBus.off(EVENT.PURCHASE, handlePurchase);
                    this.eventBus.off(EVENT.CANCEL_PURCHASE, handleCancelPurchase);
                    resolve();
                }
            };
            const handleCancelPurchase = () => {
                waitingCount--;
                if (waitingCount === 0) {
                    this.eventBus.off(EVENT.PURCHASE, handlePurchase);
                    this.eventBus.off(EVENT.CANCEL_PURCHASE, handleCancelPurchase);
                    resolve();
                }
            };
            let waitingCount = 0;
            this.eventBus.on(EVENT.PURCHASE, handlePurchase);
            this.eventBus.on(EVENT.CANCEL_PURCHASE, handleCancelPurchase);
            for (const encounter of encounters) {
                if (encounter.newPropertyForPurchase) {
                    this.eventBus.emit(EVENT.PROMPT_PURCHASE, encounter.newPropertyForPurchase);
                    waitingCount++;
                }
            }
            if (waitingCount === 0) {
                cc.log('no purchase, end turn');
                resolve();
            }
        });
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
        this.rollAnimationPromise = new Promise((resolve) => {
            this.eventBus.on(EVENT.DICE_ROLLED_END, resolve);
        });
    }

    private requestEndTurn() {
        this.client.request({
            type: PacketType.REQUEST,
            request_id: this.client.newId(),
            action: Action.END_TURN,
            payload: {},
        });
    }

    private requestPurchase(propertyForPurchase: PropertyForPurchaseEncounter) {
        const propertyPos = propertyForPurchase.properties[0].pos;

        this.client
            .request<PurchasePayload>({
                type: PacketType.REQUEST,
                request_id: this.client.newId(),
                action: Action.PURCHASE,
                payload: {
                    propertyPos,
                },
            })
            .then((response: ResponseWrapper<PurchaseResponsePayload>) => {
                if (response.ok()) {
                    this.eventBus.emit(EVENT.UPDATE_MY_MONEY, response.payload.remainingMoney);
                } else {
                    cc.log(response.getMessage());
                }
            });
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
        this.gameCamera = cc.find(GAME_CAMERA);
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
    }

    protected onDestroy() {
        for (const offListener of this.offPacketListeners) {
            offListener();
        }
        this.offPacketListeners = [];
    }

    // update (dt) {}
}
