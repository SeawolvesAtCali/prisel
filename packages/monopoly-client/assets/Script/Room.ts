import { assertExist, Client, Messages, Packet, RoomStateChangePayload } from '@prisel/client';
import { exist } from '@prisel/monopoly-common';
import { priselpb } from '@prisel/protos';
import { client, ClientState } from './Client';
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
    public playerInfoPrefab?: cc.Prefab;

    @property(cc.Node)
    public playersContainer?: cc.Node;

    @property(cc.Label)
    private roomLabel?: cc.Label;

    @property(cc.Button)
    private startButton?: cc.Button;

    private playerDataList: PlayerInfoData[] = [];

    private client: Client<ClientState> = client;

    private stateToken?: string;

    public onLoad() {
        const offGameStartListener = this.client.onGameStart(() => {
            offGameStartListener();
            cc.director.loadScene('game');
        });
    }

    private handleRoomStateChange(roomStateChange: priselpb.RoomStateChangePayload) {
        if (roomStateChange.token?.previousToken !== this.stateToken) {
            // we lost some packages. For now, lets just log and quit
            cc.log(
                `room state package lost, our token is ${this.stateToken}, token from server is ${roomStateChange.token?.previousToken}`,
            );
            return;
        }
        this.stateToken = roomStateChange.token?.token;

        if (RoomStateChangePayload.isPlayerJoin(roomStateChange)) {
            const playerJoin = assertExist(RoomStateChangePayload.getJoinedPlayer(roomStateChange));
            cc.log(`player joined ${playerJoin.name}`);
            this.playerDataList.push({
                name: playerJoin.name,
                id: playerJoin.id,
                isHost: false,
                key: playerJoin.id,
            });
        }
        if (RoomStateChangePayload.isPlayerLeave(roomStateChange)) {
            const playerLeft = assertExist(RoomStateChangePayload.getLeftPlayer(roomStateChange));
            cc.log(`player left ${playerLeft}`);
            this.playerDataList = this.playerDataList.filter((player) => player.id !== playerLeft);
        }
        if (RoomStateChangePayload.isHostLeave(roomStateChange)) {
            const hostLeave = assertExist(RoomStateChangePayload.getHostLeaveData(roomStateChange));
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
        this.client.request(Messages.getGetRoomState(this.client.newId())).then((response) => {
            if (Packet.isStatusFailed(response)) {
                cc.log('Loading room data failed');
                return;
            }
            const payload = Packet.getPayload(response, 'getRoomStateResponse');
            if (payload) {
                this.playerDataList = payload.players.map((player) => ({
                    name: player.name,
                    id: player.id,
                    isHost: player.id === payload.hostId,
                    key: player.id,
                }));
                this.setupForHost(payload.hostId === this.client.state.id);
                this.updatePlayerListUi();
                this.client.onRoomStateChange(this.handleRoomStateChange.bind(this));
                this.stateToken = payload.token;
            }
        });
    }

    private setupForHost(isHost: boolean) {
        if (!exist(this.startButton)) {
            return;
        }
        if (isHost) {
            this.startButton.node.active = true;
        } else {
            this.startButton.node.active = false;
        }
    }

    protected start() {
        cc.log('start');
        assertExist(
            this.roomLabel,
        ).string = `${this.client.state.roomName} - ${this.client.state.roomId}`;
        this.loadRoomData();
    }

    private addPlayer(player: PlayerInfoData) {
        const playerInfo = (assertExist(
            cc.instantiate(this.playerInfoPrefab),
        ) as unknown) as cc.Node;
        assertExist(this.playersContainer).addChild(playerInfo);
        playerInfo.getComponent(PlayerInfo).init(player.name, player.id);
        playerInfo.active = true;
        return playerInfo;
    }

    private updatePlayerListUi() {
        // remove all children
        cc.log('update ui');
        assertExist(this.playersContainer).removeAllChildren();
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
        const response = await this.client.request(Messages.getGameStart(this.client.newId()));

        if (Packet.isStatusOk(response)) {
            cc.director.loadScene('game');
        }
    }

    private async leaveRoom() {
        const response = await this.client.request(Messages.getLeave(this.client.newId()));
        if (Packet.isStatusOk(response)) {
            cc.director.loadScene('lobby');
        }
    }
}
