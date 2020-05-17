import { client } from './Client';
import { Client, Messages, ResponseWrapper, LoginResponsePayload } from './packages/priselClient';
import { nullCheck } from './utils';
import Dialog from './Dialog';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
    @property(Dialog)
    private dialog: Dialog = null;

    @property(cc.EditBox)
    private usernameInput: cc.EditBox = null;

    private client: Client;

    public async start() {
        nullCheck(this.dialog);
        nullCheck(this.usernameInput);
        this.dialog.setTitle('CONNECTING ...');
        this.usernameInput.node.active = false;
        this.dialog.toggleShadow(true);
        this.dialog.toggleCloseButton(false);
        this.dialog.toggleActionButton(false);

        // init logic
        await client.connect();
        this.client = client;

        this.usernameInput.node.active = true;

        this.dialog.setTitle('JOIN AS GUEST');
        this.dialog.toggleActionButton(true);
    }

    // called when input change
    private validateInput(): boolean {
        if (this.usernameInput.string.length === 0) {
            this.dialog.toggleActionButton(false);
            return false;
        }
        this.dialog.toggleActionButton(true);
        return true;
    }

    // called when button is tapped.
    // event listener set in cocoscreator
    private async handleLogin() {
        if (!this.validateInput()) {
            return;
        }
        const name = this.usernameInput.string;
        const loginResponse: ResponseWrapper<LoginResponsePayload> = await this.client.request(
            Messages.getLogin(this.client.newId(), name),
        );

        if (loginResponse.ok()) {
            this.client.setState({
                id: loginResponse.payload.userId,
                name,
            });
            cc.director.loadScene('lobby');
        }
    }
}
