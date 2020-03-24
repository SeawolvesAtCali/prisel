const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerInfo extends cc.Component {
    @property(cc.Label)
    public nameLabel: cc.Label = null;

    @property(cc.Label)
    public idLabel: cc.Label = null;

    public id: number = -1;

    public init(name: string, id: string) {
        this.nameLabel.string = name;
        this.idLabel.string = id;
        this.node.active = true;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    public start() {}

    // update (dt) {}
}
