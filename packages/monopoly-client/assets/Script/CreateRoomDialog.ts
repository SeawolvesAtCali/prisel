import {
    Client,
    CreateRoomPayload,
    CreateRoomResponsePayload,
    Messages,
    ResponseWrapper,
} from '@prisel/client';
import { client, ClientState } from './Client';
import { nullCheck } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreateRoomDialog extends cc.Component {
    @property(cc.EditBox)
    private roomNameInput: cc.EditBox = null;
    private client: Client<ClientState> = null;

    protected start() {
        this.client = nullCheck(client);
        nullCheck(this.roomNameInput);
        this.node.active = false;
    }

    // call when edit box enter or "CREATE" button click
    // handlers wired in cocoscreator
    private async createRoom() {
        const response: ResponseWrapper<CreateRoomResponsePayload> = await this.client.request<
            CreateRoomPayload
        >(Messages.getCreateRoom(this.client.newId(), this.roomNameInput.string));

        if (response.ok()) {
            const payload = response.payload;
            this.client.setState({
                roomId: payload.room.id,
                isInRoom: true,
                roomName: payload.room.name,
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
