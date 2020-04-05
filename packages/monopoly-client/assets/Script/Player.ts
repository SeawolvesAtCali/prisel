import { PlayerInfo } from './packages/priselClient';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Label)
    private label: cc.Label = null;

    // @property
    // public text: string = 'hello';

    private playerName: string = '';
    private playerId: string = '';
    public color: cc.Color = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public init(playerData: PlayerInfo, color: cc.Color) {
        this.playerName = playerData.name;
        this.playerId = playerData.id;
        this.node.color = color;
        this.color = color;
    }

    public getId() {
        return this.playerId;
    }

    public start() {
        this.label.string = this.playerName;
    }

    // update (dt) {}
}
