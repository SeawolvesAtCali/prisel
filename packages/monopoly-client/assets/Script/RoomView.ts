import { nullCheck } from './utils';
import { client, ClientState } from './Client';
import {
    Client,
    ResponseWrapper,
    JoinResponsePayload,
    Messages,
    LobbyRoomViewInfo,
    JoinPayload,
} from '@prisel/client';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomView extends cc.Component {
    @property(cc.Label)
    private roomNameLabel: cc.Label = null;

    @property(cc.Label)
    private capacityLabel: cc.Label = null;

    private roomViewInfo: LobbyRoomViewInfo = null;
    private client: Client<ClientState>;

    public setValue(roomViewInfo: LobbyRoomViewInfo) {
        this.roomViewInfo = roomViewInfo;
        this.roomNameLabel.string = roomViewInfo.room.name;
        this.capacityLabel.string = `${roomViewInfo.playerCount}/${roomViewInfo.maxPlayers}`;
    }

    protected start() {
        nullCheck(this.roomNameLabel);
        nullCheck(this.capacityLabel);
        this.client = client;
        this.node.on(cc.Node.EventType.TOUCH_END, this.handleJoin, this);
    }

    private async handleJoin() {
        const response: ResponseWrapper<JoinResponsePayload> = await this.client.request<
            JoinPayload
        >(Messages.getJoin(this.client.newId(), nullCheck(this.roomViewInfo).room.id));

        if (response.ok()) {
            const payload = response.payload;
            this.client.setState({
                roomId: payload.room.id,
                roomName: payload.room.name,
                isInRoom: true,
            });
            cc.director.loadScene('room');
        } else {
            cc.log('cannot join room, message: ' + response.status.message);
        }
    }

    // update (dt) {}
}
