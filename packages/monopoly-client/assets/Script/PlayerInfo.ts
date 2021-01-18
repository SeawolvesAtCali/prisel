import { assertExist } from '@prisel/client';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerInfo extends cc.Component {
    @property(cc.Label)
    public nameLabel?: cc.Label;

    public id: string = '';

    public init(name: string, id: string) {
        assertExist(this.nameLabel).string = name;
        this.id = id;
    }

    public start() {
        assertExist(this.nameLabel, 'nameLabel is missing');
    }
}
