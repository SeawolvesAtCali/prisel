import { client } from './Client';
import { Client, Messages, ResponseWrapper, LoginResponsePayload } from './packages/priselClient';
import { nullCheck } from './utils';
import { PERSISTENT_NODE } from './consts';
import { createDialog } from './components/DialogUtil';
import { createInput } from './components/Input';
import { WidgetConfig } from './components/WidgetConfig';
import { NodeConfig } from './components/NodeConfig';
import { SpriteConfig } from './components/SpriteConfig';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
    private client: Client;
    private nickname: string;
    private actionButton: cc.Button;

    public async start() {
        cc.game.addPersistRootNode(nullCheck(cc.find(PERSISTENT_NODE)));
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

        this.nickname = 'player';

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
            .find(nullCheck(joinDialogConfig.exports).actionButton, joinDialog)
            .getComponent(cc.Button);

        this.validateInput();
    }

    // called when input change
    private validateInput(): boolean {
        if (this.nickname === '') {
            this.actionButton.interactable = false;
            return false;
        }
        this.actionButton.interactable = true;
        return true;
    }

    // called when button is tapped.
    // event listener set in cocoscreator
    private async handleLogin() {
        if (!this.validateInput()) {
            return;
        }
        const name = this.nickname;
        this.actionButton.interactable = false;
        const loginResponse: ResponseWrapper<LoginResponsePayload> = await this.client.request(
            Messages.getLogin(this.client.newId(), name),
        );
        this.actionButton.interactable = true;
        if (loginResponse.ok()) {
            this.client.setState({
                id: loginResponse.payload.userId,
                name,
            });
            cc.director.loadScene('lobby');
        }
    }
}
