import { EVENT_BUS, EVENT } from './consts';
import { client, ClientState } from './Client';
import {
    Client,
    Messages,
    ResponseWrapper,
    LobbyStateResponsePayload,
} from './packages/priselClient';
import { nullCheck } from './utils';
import RoomView from './RoomView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Lobby extends cc.Component {
    private client: Client<ClientState> = null;
    @property(cc.Node)
    private roomViewList: cc.Node = null;
    @property(cc.Prefab)
    private roomViewPrefab: cc.Prefab = null;

    protected start() {
        this.client = nullCheck(client);
        nullCheck(this.roomViewList);
        nullCheck(this.roomViewPrefab);
        // check lobby state every
        this.schedule(this.checkLobbyState, 0.5);
    }

    private async checkLobbyState() {
        const response: ResponseWrapper<LobbyStateResponsePayload> = await this.client.request(
            Messages.getGetLobbyState(this.client.newId()),
        );
        if (response.ok()) {
            const joinableRooms = response.payload.rooms.filter(
                (room) => room.playerCount < room.maxPlayers,
            );

            // make sure we have enough views
            while (this.roomViewList.childrenCount < joinableRooms.length) {
                this.roomViewList.addChild(cc.instantiate(this.roomViewPrefab));
            }

            this.roomViewList.children.forEach((roomView, index) => {
                roomView.active = index < joinableRooms.length;
                if (index < joinableRooms.length) {
                    roomView.getComponent(RoomView).setValue(joinableRooms[index]);
                }
            });
        }
    }
}
