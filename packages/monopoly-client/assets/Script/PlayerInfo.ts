import { nullCheck } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerInfo extends cc.Component {
    @property(cc.Label)
    public nameLabel: cc.Label = null;

    public id: string = '';

    public init(name: string, id: string) {
        this.nameLabel.string = name;
        this.id = id;
    }

    public start() {
        nullCheck(this.nameLabel);
    }
}
