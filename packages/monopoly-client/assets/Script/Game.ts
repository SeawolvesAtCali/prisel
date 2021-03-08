import { assertExist, Messages, Packet, Request, Response } from '@prisel/client';
import { Action, BoardSetup, MonopolyWorld, World } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { client } from './Client';
import { CHARACTER_COLORS, EVENT, EVENT_BUS } from './consts';
import MapLoader from './MapLoader';
import Player from './Player';
import { lifecycle } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property
    private mapJsonPath = '';

    @property(cc.Prefab)
    private playerPrefab?: cc.Prefab;

    @property(cc.Node)
    private mapNode?: cc.Node;

    private funcWaitingForStart: Array<() => void> = [];
    private started = false;
    private client = client;
    private offPacketListeners: Array<() => void> = [];
    private map?: MapLoader;
    private playerNodes: cc.Node[] = [];

    public world?: World;

    private eventBus?: cc.Node;

    private static instance?: Game;

    public static get() {
        return assertExist(Game.instance, 'Game instance');
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
        this.world = new MonopolyWorld().populate(boardSetup.world);
        this.map = assertExist(this.mapNode, 'mapNode').getComponent(MapLoader);
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

        // inital state payload
        const response = await this.client.request(
            Request.forAction(Action.GET_INITIAL_STATE).setId(this.client.newId()).build(),
        );

        const initialStateResponse = assertExist(
            Packet.getPayload(response, monopolypb.GetInitialStateResponse),
            'initialStateResponse',
        );

        // CHARACTER_COLORS[gamePlayer.character]
        for (const gamePlayer of initialStateResponse.players) {
            if (gamePlayer.boundPlayer?.id === this.client.state.id) {
                this.client.setState({ gamePlayerId: gamePlayer.id });
                this.eventBus?.emit(EVENT.UPDATE_MY_GAME_PLAYER_INFO, gamePlayer);
            }
            const newPlayer = this.instantiatePlayer(gamePlayer);
            this.playerNodes.push(newPlayer);
        }

        this.client.emit<Packet>(Packet.forAction(Action.READY_TO_START_GAME).build());
    }

    private handleAnnounceStartTurn(packet: Packet) {
        cc.log('handleAnnounceStartTurn');
        const announceStartTurnPayload = assertExist(
            Packet.getPayload(packet, monopolypb.AnnounceStartTurnPayload),
            'announceStartTurnPayload',
        );
        cc.log(
            `is current player? ${announceStartTurnPayload.player}==${this.client.state.gamePlayerId}`,
        );
        const isCurrentPlayerTurn =
            announceStartTurnPayload.player === this.client.state.gamePlayerId;
        if (isCurrentPlayerTurn) {
            this.eventBus?.emit(EVENT.START_CURRENT_PLAYER_TURN);
        }
    }

    public getPlayerNodes(): cc.Node[] {
        return this.playerNodes;
    }
    public getPlayerNode(id: string): cc.Node | undefined {
        return this.getPlayerNodes().find((node) => node.getComponent(Player).getId() === id);
    }

    private async handleAnnounceRoll(packet: Packet) {
        const announceRollPayload = assertExist(
            Packet.getPayload(packet, monopolypb.AnnounceRollPayload),
            'announceRollPayload',
        );
        const { player } = announceRollPayload;

        const playerNode = assertExist(
            this.getPlayerNode(player),
            'playerNode in handleAnnounceRoll',
        );
        const playerComponent = playerNode.getComponent(Player);
        playerComponent.pos = announceRollPayload.currentPosition;
    }

    private handleAnnouncePayRent(packet: Packet) {
        const announcePayRentPayload = assertExist(
            Packet.getPayload(packet, monopolypb.AnnouncePayRentPayload),
            'announcePayRentPayload',
        );
        this.eventBus?.emit(EVENT.UPDATE_MY_MONEY, announcePayRentPayload.myCurrentMoney);
    }

    private async handlePurchasePrompt(packet: Request) {
        const promptPurchaseRequest = assertExist(
            Packet.getPayload(packet, monopolypb.PromptPurchaseRequest),
            'promptPurchaseRequest',
        );

        this.eventBus?.emit(EVENT.PROMPT_PURCHASE, promptPurchaseRequest);
        const purchase = await new Promise<boolean>((resolve) => {
            this.eventBus?.once(EVENT.PURCHASE_DECISION, resolve);
        });
        cc.log('purchase decision ' + purchase);

        this.client.respond(
            Response.forRequest(packet)
                .setPayload(monopolypb.PromptPurchaseResponse, {
                    purchased: purchase,
                })
                .build(),
        );
        if (purchase) {
            this.eventBus?.emit(EVENT.UPDATE_MY_MONEY, promptPurchaseRequest.moneyAfterPurchase);
        }
    }

    private async handleChanceConfirmationPrompt(packet: Request) {
        await new Promise<void>((resolve) => this.eventBus?.once(EVENT.CONFIRM_CHANCE, resolve));
        // TODO if user doesn't click on the chance to dismiss it. It will be
        // dismissed after 10 seconds. We will still have this promise, which
        // is a memory leak

        this.client.respond(Response.forRequest(packet).build());
    }

    private handleAnnouncePurchase(packet: Packet) {
        const announcePlayerPurchasePayload = assertExist(
            Packet.getPayload(packet, monopolypb.AnnouncePurchasePayload),
            'announcePlayerPurchasePayload',
        );

        const { property: purchasedProperty, player: gamePlayerId } = announcePlayerPurchasePayload;
        const player = this.playerNodes
            .find((playerNode) => playerNode.getComponent(Player).getId() === gamePlayerId)
            ?.getComponent(Player);
        if (player) {
            const property = this.map?.getPropertyTileAt(
                assertExist(purchasedProperty?.pos, 'purchasedProperty?.pos'),
            );
            property?.setOwner(player, assertExist(purchasedProperty, 'purchasedProperty'));
        } else {
            cc.error(
                `Cannot find Player with id ${gamePlayerId} that purchased property ${purchasedProperty?.name}`,
            );
        }
    }

    private handleAnnounceEndTurn(packet: Packet) {
        const announceEndTurnPayload = assertExist(
            Packet.getPayload(packet, monopolypb.AnnounceEndTurnPayload),
            'announceEndTurnPayload',
        );

        const isCurrentPlayerTurn =
            announceEndTurnPayload.currentPlayer === this.client.state.gamePlayerId;
        if (isCurrentPlayerTurn) {
            this.eventBus?.emit(EVENT.END_CURRENT_PLAYER_TURN);
        }

        this.eventBus?.emit(EVENT.NO_MORE_PACKET_FROM_SERVER_FOR_CURRENT_TURN);
    }

    private handleAnnounceBankrupt(packet: Packet) {
        const announceBankruptPayload = assertExist(
            Packet.getPayload(packet, monopolypb.AnnounceBankruptPayload),
            'announceBankruptPayload',
        );
        cc.log('player bankrupted ' + announceBankruptPayload.player);
    }

    private async handleAnnounceGameOver(packet: Packet) {
        const announceGameOverPayload = assertExist(
            Packet.getPayload(packet, monopolypb.AnnounceGameOverPayload),
            'announceGameOverPayload',
        );
        cc.log('game over ', announceGameOverPayload);
        this.eventBus?.emit(EVENT.SHOW_RANKING, announceGameOverPayload.ranks);
        await new Promise((resolve) => {
            this.eventBus?.once(EVENT.RANKING_CLOSED, resolve);
        });
        const response = await this.client.request(
            Request.forAction(Action.BACK_TO_ROOM).setId(this.client.newId()).build(),
        );

        if (Packet.isStatusOk(response)) {
            cc.director.loadScene('room');
        } else {
            cc.log(Packet.getStatusMessage(response));
        }
    }

    private handleAnnounceLeft(packet: Packet) {
        const announcePlayerLeftPayload = Packet.getPayload(
            packet,
            monopolypb.AnnouncePlayerLeftPayload,
        );
        cc.log('player left', announcePlayerLeftPayload);
    }

    private async requestRoll() {
        const response = await this.client.request(
            Request.forAction(Action.ROLL).setId(this.client.newId()).build(),
        );
        const rollResponse = Packet.getPayload(response, monopolypb.RollResponse);

        if (Packet.isStatusOk(response) && rollResponse) {
            this.eventBus?.emit(EVENT.DICE_ROLLED_RESPONSE, rollResponse.steps);
        }
    }

    private instantiatePlayer(gamePlayer: monopolypb.GamePlayer): cc.Node {
        const playerNode = assertExist(this.map, 'Game.map').addToMap(
            (cc.instantiate(this.playerPrefab) as unknown) as cc.Node,
            assertExist(gamePlayer.pos, 'gamePlayer.pos'),
        );
        const playerComponent = playerNode.getComponent(Player);
        playerComponent.init(
            gamePlayer,
            CHARACTER_COLORS[gamePlayer.character],
            assertExist(gamePlayer.pos, 'gamePlayer.pos'),
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
        if (Packet.isStatusOk(response)) {
            cc.director.loadScene('lobby');
        }
    }

    @lifecycle
    protected start() {
        this.started = true;
        this.eventBus = assertExist(cc.find(EVENT_BUS), 'EVENT_BUS');
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
