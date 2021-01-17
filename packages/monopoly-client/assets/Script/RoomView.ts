import { Client, Messages, Packet } from '@prisel/client';
import { exist } from '@prisel/monopoly-common';
import { get_lobby_state_spec } from '@prisel/protos';
import { client, ClientState } from './Client';
import { nullCheck } from './utils';

const { ccclass, property } = cc._decorator;

type LobbyRoomViewInfo = get_lobby_state_spec.GetLobbyStateResponse_LobbyRoomViewInfo;
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
        const response = await this.client.request(
            Messages.getJoin(this.client.newId(), nullCheck(this.roomViewInfo).room.id),
        );
        // Packet.getPayload()
        const payload = Packet.getPayload(response, 'joinResponse');
        if (Packet.isStatusOk(response) && exist(payload)) {
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
