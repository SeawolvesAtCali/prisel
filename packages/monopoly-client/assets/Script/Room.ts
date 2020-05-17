import { client, ClientState } from './Client';
import {
    Client,
    Messages,
    RoomStateResponsePayload,
    ResponseWrapper,
    RoomChangePayload,
} from './packages/priselClient';
import PlayerInfo from './PlayerInfo';

const { ccclass, property } = cc._decorator;

interface PlayerInfoData {
    name: string;
    id: string;
    isHost: boolean;
    key: any;
}

const PLAYER_CARD_HEIGHT = 150;
@ccclass
export default class Room extends cc.Component {
    @property(cc.Prefab)
    public playerInfoPrefab: cc.Prefab = null;

    @property(cc.Node)
    public playersContainer: cc.Node = null;

    @property(cc.Label)
    private roomLabel: cc.Label = null;

    @property(cc.Button)
    private startButton: cc.Button = null;

    private playerDataList: PlayerInfoData[] = [];

    private client: Client<ClientState>;

    private stateToken: string = null;

    public onLoad() {
        this.client = client;
        const offGameStartListener = this.client.onGameStart(() => {
            offGameStartListener();
            cc.director.loadScene('game');
        });
    }

    private handleRoomStateChange(roomStateChange: RoomChangePayload) {
        if (roomStateChange.token.previousToken !== this.stateToken) {
            // we lost some packages. For now, lets just log and quit
            cc.log(
                `room state package lost, our token is ${this.stateToken}, token from server is ${roomStateChange.token.previousToken}`,
            );
            return;
        }
        const { token, playerJoin, playerLeave, hostLeave } = roomStateChange;
        this.stateToken = token.token;
        if (playerJoin) {
            cc.log(`player joined ${playerJoin.name}`);
            this.playerDataList.push({
                name: playerJoin.name,
                id: playerJoin.id,
                isHost: false,
                key: playerJoin.id,
            });
        }
        if (playerLeave) {
            cc.log(`player left ${playerLeave.id}`);
            this.playerDataList = this.playerDataList.filter(
                (player) => player.id !== playerLeave.id,
            );
        }
        if (hostLeave) {
            cc.log(`host left ${hostLeave.hostId}, new host ${hostLeave.newHostId}`);
            this.playerDataList = this.playerDataList.filter(
                (player) => player.id !== hostLeave.hostId,
            );
            const newHost = this.playerDataList.find((player) => player.id === hostLeave.newHostId);
            if (newHost) {
                newHost.isHost = true;
            }
            this.setupForHost(hostLeave.newHostId === this.client.state.id);
        }
        this.updatePlayerListUi();
    }

    private loadRoomData() {
        cc.log('start loading room data');
        this.client
            .request(Messages.getGetRoomState(this.client.newId()))
            .then((response: ResponseWrapper<RoomStateResponsePayload>) => {
                if (response.failed()) {
                    cc.log('Loading room data failed');
                    return;
                }
                this.playerDataList = response.payload.players.map((player) => ({
                    name: player.name,
                    id: player.id,
                    isHost: player.id === response.payload.hostId,
                    key: player.id,
                }));
                this.setupForHost(response.payload.hostId === this.client.state.id);
                this.updatePlayerListUi();
                this.client.onRoomStateChange(this.handleRoomStateChange.bind(this));
                this.stateToken = response.payload.token;
            });
    }

    private setupForHost(isHost: boolean) {
        if (isHost) {
            this.startButton.node.active = true;
        } else {
            this.startButton.node.active = false;
        }
    }

    protected start() {
        cc.log('start');
        this.roomLabel.string = `${this.client.state.roomName} - ${this.client.state.roomId}`;
        this.loadRoomData();
    }

    private addPlayer(player: PlayerInfoData) {
        const playerInfo = cc.instantiate(this.playerInfoPrefab);
        this.playersContainer.addChild(playerInfo);
        playerInfo.getComponent(PlayerInfo).init(player.name, player.id);
        playerInfo.active = true;
        return playerInfo;
    }

    private updatePlayerListUi() {
        // remove all children
        cc.log('update ui');
        this.playersContainer.removeAllChildren();
        let height = 0;
        for (const player of this.playerDataList) {
            const playerInfo = this.addPlayer(player);
            playerInfo.y = height;
            playerInfo.x = 0;
            height = height - PLAYER_CARD_HEIGHT - 10;
            cc.log('added player at ' + playerInfo.x + ' ' + playerInfo.y);
        }
    }

    private async startGame() {
        const response: ResponseWrapper = await this.client.request(
            Messages.getGameStart(this.client.newId()),
        );

        if (response.ok()) {
            cc.director.loadScene('game');
        }
    }

    private async leaveRoom() {
        const response: ResponseWrapper = await this.client.request(
            Messages.getLeave(this.client.newId()),
        );
        if (response.ok()) {
            cc.director.loadScene('lobby');
        }
    }
}
