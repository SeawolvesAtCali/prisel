import { Client } from '@prisel/client';
import { createClient } from './Client';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
    @property(cc.Label)
    public label: cc.Label = null;

    @property(cc.Button)
    public loginButton: cc.Button = null;

    @property(cc.EditBox)
    public usernameInput: cc.EditBox = null;

    private client: Client;

    public start() {
        // init logic
        createClient().then((client) => {
            this.client = client;
            this.loginButton.node.on('click', this.handleLogin, this);
        });
    }

    private handleLogin(button): void {
        this.client.login(this.usernameInput.string).then((loginResponse) => {
            this.label.string = loginResponse.userId;
        });
    }
}
