import { EVENT_BUS, EVENT } from './consts';
import { client, ClientState } from './Client';
import {
    Client,
    Messages,
    ResponseWrapper,
    LobbyStateResponsePayload,
    CreateRoomPayload,
    CreateRoomResponsePayload,
} from '@prisel/client';
import { nullCheck } from './utils';
import RoomView from './RoomView';
import Dialog from './Dialog';

const { ccclass, property } = cc._decorator;

const DEFAULT_ROOM_NAME = 'room';
@ccclass
export default class Lobby extends cc.Component {
    private client: Client<ClientState> = null;
    @property(cc.Node)
    private roomViewList: cc.Node = null;
    @property(cc.Prefab)
    private roomViewPrefab: cc.Prefab = null;

    @property(Dialog)
    private createRoomDialog: Dialog = null;

    @property(cc.EditBox)
    private roomNameInput: cc.EditBox = null;

    protected start() {
        nullCheck(this.roomNameInput);
        nullCheck(this.createRoomDialog);

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

    // handlers wired in cocoscreator
    private toggleCreateRoomDialog(_, show: string) {
        this.createRoomDialog.node.active = show === 'true';
        this.roomNameInput.string = DEFAULT_ROOM_NAME;
        this.validateCreateRoomInput();
    }

    private validateCreateRoomInput() {
        this.createRoomDialog.toggleActionButton(this.roomNameInput.string !== '');
    }
}
