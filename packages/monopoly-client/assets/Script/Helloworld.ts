import { client } from './Client';
import { Client, Messages, ResponseWrapper, LoginResponsePayload } from './packages/priselClient';
import { nullCheck } from './utils';
const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
    @property(cc.Button)
    private loginButton: cc.Button = null;

    @property(cc.EditBox)
    private usernameInput: cc.EditBox = null;

    @property(cc.Label)
    private title: cc.Label = null;

    private client: Client;

    public async start() {
        nullCheck(this.loginButton);
        nullCheck(this.usernameInput);
        nullCheck(this.title).string = 'CONNECTING ...';
        // init logic
        await client.connect();

        this.title.string = 'JOIN AS GUEST';
        this.client = client;
        this.loginButton.node.active = true;
        this.usernameInput.node.active = true;
        this.loginButton.node.on('click', this.handleLogin, this);
    }

    private async handleLogin() {
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
