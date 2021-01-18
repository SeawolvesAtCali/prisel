import { assertExist, Messages, Packet } from '@prisel/client';
import { exist } from '@prisel/monopoly-common';
import { client } from './Client';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreateRoomDialog extends cc.Component {
    @property(cc.EditBox)
    private roomNameInput?: cc.EditBox;
    private client = client;

    protected start() {
        this.client = assertExist(client);
        assertExist(this.roomNameInput);
        this.node.active = false;
    }

    // call when edit box enter or "CREATE" button click
    // handlers wired in cocoscreator
    private async createRoom() {
        const response = await this.client.request(
            Messages.getCreateRoom(this.client.newId(), this.roomNameInput?.string || 'room name'),
        );

        const createRoomResponse = Packet.getPayload(response, 'createRoomResponse');
        if (Packet.isStatusOk(response) && exist(createRoomResponse)) {
            this.client.setState({
                roomId: createRoomResponse.room?.id,
                isInRoom: true,
                roomName: createRoomResponse.room?.name,
            });
            cc.director.loadScene('room');
        } else {
            cc.log('cannot create room, message: ' + response.status.message);
        }
    }

    private show() {
        this.node.active = true;
    }
    // called when "CANCEL" button click
    // handler wired through cocoscreator
    private hide() {
        this.node.active = false;
    }
}
