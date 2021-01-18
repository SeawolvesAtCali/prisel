import { assertExist, Client, Messages, Packet } from '@prisel/client';
import { exist } from '@prisel/monopoly-common';
import { client, ClientState } from './Client';
import Dialog from './Dialog';
import RoomView from './RoomView';

const { ccclass, property } = cc._decorator;

const DEFAULT_ROOM_NAME = 'room';
@ccclass
export default class Lobby extends cc.Component {
    private client: Client<ClientState> = client;
    @property(cc.Node)
    private roomViewList?: cc.Node;
    @property(cc.Prefab)
    private roomViewPrefab?: cc.Prefab;

    @property(Dialog)
    private createRoomDialog?: Dialog;

    @property(cc.EditBox)
    private roomNameInput?: cc.EditBox;

    protected start() {
        assertExist(this.roomNameInput);
        assertExist(this.createRoomDialog);

        assertExist(this.roomViewList);
        assertExist(this.roomViewPrefab);
        // check lobby state every
        this.schedule(this.checkLobbyState, 0.5);
    }

    private async checkLobbyState() {
        const response = await this.client.request(Messages.getGetLobbyState(this.client.newId()));
        const lobbyState = Packet.getPayload(response, 'getLobbyStateResponse');
        if (Packet.isStatusOk(response) && exist(lobbyState)) {
            const joinableRooms = lobbyState.rooms.filter(
                (room) => room.playerCount < room.maxPlayers,
            );

            // make sure we have enough views
            if (exist(this.roomViewList)) {
                while (this.roomViewList.childrenCount < joinableRooms.length) {
                    this.roomViewList.addChild(
                        (cc.instantiate(this.roomViewPrefab) as unknown) as cc.Node,
                    );
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

    // call when edit box enter or "CREATE" button click
    // handlers wired in cocoscreator
    private async createRoom() {
        const response = await this.client.request(
            Messages.getCreateRoom(this.client.newId(), this.roomNameInput?.string ?? ''),
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

    // handlers wired in cocoscreator
    private toggleCreateRoomDialog(_: any, show: string) {
        if (exist(this.createRoomDialog)) {
            this.createRoomDialog.node.active = show === 'true';
        }
        if (exist(this.roomNameInput)) {
            this.roomNameInput.string = DEFAULT_ROOM_NAME;
        }
        this.validateCreateRoomInput();
    }

    private validateCreateRoomInput() {
        this.createRoomDialog?.toggleActionButton(this.roomNameInput?.string !== '');
    }
}
