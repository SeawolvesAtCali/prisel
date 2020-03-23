import {
    Client,
    CreateRoomPayload,
    Messages,
    JoinPayload,
    RoomInfoPayload,
} from './packages/client/prisel.umd.js';

import { client, ClientState } from './Client';
const { ccclass, property } = cc._decorator;

@ccclass
export default class CreateOrJoinRoom extends cc.Component {
    @property(cc.Button)
    public joinButton: cc.Button = null;

    @property(cc.EditBox)
    public joinRoomIdInput: cc.EditBox = null;

    @property(cc.Button)
    public createButton: cc.Button = null;

    @property(cc.EditBox)
    public createRoomNameInput: cc.EditBox = null;

    private client: Client<ClientState>;

    public onLoad() {
        this.client = client;
    }

    public start() {
        this.createButton.node.on('click', this.handleCreate, this);
        this.joinButton.node.on('click', this.handleJoin, this);
    }

    private handleCreate() {
        this.client
            .request<CreateRoomPayload>(
                Messages.getCreateRoom(this.client.newId(), this.createRoomNameInput.string),
            )
            .then((response) => {
                if (response.ok()) {
                    const payload = response.payload as RoomInfoPayload;
                    this.client.setState({
                        roomId: payload.id,
                        isInRoom: true,
                        roomName: payload.name,
                    });
                    cc.director.loadScene('room');
                } else {
                    cc.log('cannot create room, message: ' + response.status.message);
                }
            });
    }

    private handleJoin() {
        this.client
            .request<JoinPayload>(
                Messages.getJoin(this.client.newId(), this.joinRoomIdInput.string),
            )
            .then((response) => {
                if (response.ok()) {
                    const payload = response.payload as RoomInfoPayload;
                    this.client.setState({
                        roomId: payload.id,
                        roomName: payload.name,
                        isInRoom: true,
                    });
                    cc.director.loadScene('room');
                } else {
                    cc.log('cannot join room, message: ' + response.status.message);
                }
            });
    }
}
