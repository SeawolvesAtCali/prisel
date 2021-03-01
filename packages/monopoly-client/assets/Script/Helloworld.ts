import { assertExist, Client, Messages, Packet } from '@prisel/client';
import { exist } from '@prisel/monopoly-common';
import { client } from './Client';
import { createDialog } from './components/DialogUtils';
import { createInput } from './components/Input';
import { WidgetConfig } from './components/WidgetConfig';
import { PERSISTENT_NODE } from './consts';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
    private client: Client = client;
    private nickname = 'player';
    private actionButton?: cc.Button;

    public async start() {
        cc.game.addPersistRootNode(assertExist(cc.find(PERSISTENT_NODE)));
        const canvas = cc.find('Canvas');

        const connectingDialog = createDialog({
            name: 'connecting dialog',
            title: 'CONNECTING ...',
            actionText: 'JOIN',
        }).render();
        canvas.addChild(connectingDialog);

        // init logic
        await client.connect();
        this.client = client;

        canvas.removeChild(connectingDialog);

        const joinDialogConfig = createDialog({
            name: 'join dialog',
            title: 'JOIN AS GUEST',
            actionText: 'JOIN',
            content: createInput({
                name: 'username input',
                placeholder: 'Enter nickname',
                initialText: this.nickname,
                widget: WidgetConfig.custom(undefined, 20, undefined, 20),
                onChange: (e) => {
                    this.nickname = e.string;
                    this.validateInput();
                },
                onEnter: this.handleLogin.bind(this),
            }),
            onAction: this.handleLogin.bind(this),
        });
        const joinDialog = joinDialogConfig.render();
        canvas.addChild(joinDialog);
        this.actionButton = cc
            .find(assertExist(joinDialogConfig.exports).actionButton, joinDialog)
            .getComponent(cc.Button);

        this.validateInput();
    }

    // called when input change
    private validateInput(): boolean {
        if (this.nickname === '') {
            if (this.actionButton) {
                this.actionButton.interactable = false;
            }
            return false;
        }
        if (this.actionButton) {
            this.actionButton.interactable = true;
        }
        return true;
    }

    // called when button is tapped.
    // event listener set in cocoscreator
    private async handleLogin() {
        if (!this.validateInput()) {
            return;
        }
        const name = this.nickname;
        if (this.actionButton) {
            this.actionButton.interactable = false;
        }
        const response = await this.client.request(Messages.getLogin(this.client.newId(), name));
        if (this.actionButton) {
            this.actionButton.interactable = true;
        }
        const loginResponsePayload = Packet.getPayload(response, 'loginResponse');
        if (Packet.isStatusOk(response) && exist(loginResponsePayload)) {
            this.client.setState({
                id: loginResponsePayload.userId,
                name,
            });
            cc.director.loadScene('lobby');
        }
    }
}
