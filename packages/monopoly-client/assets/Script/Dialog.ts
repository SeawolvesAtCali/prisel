import { nullCheck } from './utils';

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
    private titleLabel: cc.Label = null;

    @property(cc.Button)
    private actionButton: cc.Button = null;

    @property(cc.Button)
    private closeButton: cc.Button = null;

    @property(cc.Node)
    private shadow: cc.Node = null;

    public setTitle(value: string) {
        this.title = value;
        this.titleLabel.string = value;
    }

    public toggleShadow(showShadow: boolean) {
        this.shadow.active = showShadow;
    }

    public toggleCloseButton(showCloseButton: boolean) {
        this.closeButton.node.active = showCloseButton;
    }

    public toggleActionButton(enabled: boolean) {
        this.actionButton.interactable = enabled;
    }

    protected start() {
        nullCheck(this.titleLabel).string = this.title;
        nullCheck(this.shadow);
        nullCheck(this.actionButton).clickEvents = this.onAction;
        nullCheck(this.closeButton).clickEvents = this.onClose;
    }
}
