import { assertExist, Client, Messages, Packet } from '@prisel/client';
import { exist } from '@prisel/monopoly-common';
import { priselpb } from '@prisel/protos';
import { client, ClientState } from './Client';

const { ccclass, property } = cc._decorator;

type LobbyRoomViewInfo = priselpb.GetLobbyStateResponse_LobbyRoomViewInfo;
@ccclass
export default class RoomView extends cc.Component {
    @property(cc.Label)
    private roomNameLabel?: cc.Label;

    @property(cc.Label)
    private capacityLabel?: cc.Label;

    private roomViewInfo?: LobbyRoomViewInfo;
    private client: Client<ClientState> = client;

    public setValue(roomViewInfo: LobbyRoomViewInfo) {
        this.roomViewInfo = roomViewInfo;
        if (this.roomNameLabel) {
            this.roomNameLabel.string = roomViewInfo.room?.name || '';
        }
        if (this.capacityLabel) {
            this.capacityLabel.string = `${roomViewInfo.playerCount}/${roomViewInfo.maxPlayers}`;
        }
    }

    protected start() {
        assertExist(this.roomNameLabel);
        assertExist(this.capacityLabel);
        this.node.on(cc.Node.EventType.TOUCH_END, this.handleJoin, this);
    }

    private async handleJoin() {
        const roomId = assertExist(this.roomViewInfo?.room?.id);
        const response = await this.client.request(Messages.getJoin(this.client.newId(), roomId));
        const payload = Packet.getPayload(response, 'joinResponse');
        if (Packet.isStatusOk(response) && exist(payload)) {
            this.client.setState({
                roomId: payload.room?.id,
                roomName: payload.room?.name,
                isInRoom: true,
            });
            cc.director.loadScene('room');
        } else {
            cc.log('cannot join room, message: ' + Packet.getStatusMessage(response));
        }
    }

    // update (dt) {}
}
