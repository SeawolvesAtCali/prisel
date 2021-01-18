import { assertExist } from '@prisel/client';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dialog extends cc.Component {
    @property
    private title: string = 'title';

    @property(cc.Component.EventHandler)
    private onClose: cc.Component.EventHandler[] = [];

    @property(cc.Component.EventHandler)
    private onAction: cc.Component.EventHandler[] = [];

    @property(cc.Label)
    private titleLabel?: cc.Label;

    @property(cc.Button)
    private actionButton?: cc.Button;

    @property(cc.Button)
    private closeButton?: cc.Button;

    @property(cc.Node)
    private shadow?: cc.Node;

    public setTitle(value: string) {
        this.title = value;
        assertExist(this.titleLabel).string = value;
    }

    public toggleShadow(showShadow: boolean) {
        assertExist(this.shadow).active = showShadow;
    }

    public toggleCloseButton(showCloseButton: boolean) {
        assertExist(this.closeButton).node.active = showCloseButton;
    }

    public toggleActionButton(enabled: boolean) {
        assertExist(this.actionButton).interactable = enabled;
    }

    protected start() {
        assertExist(this.titleLabel).string = this.title;
        assertExist(this.shadow);
        assertExist(this.actionButton).clickEvents = this.onAction;
        assertExist(this.closeButton).clickEvents = this.onClose;
    }
}
