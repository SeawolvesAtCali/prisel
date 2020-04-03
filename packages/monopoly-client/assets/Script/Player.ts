import { PlayerInfo } from './packages/priselClient';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    // @property(cc.Label)
    // public label: cc.Label = null;

    // @property
    // public text: string = 'hello';

    private playerName: string = '';
    private playerId: string = '';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public init(playerData: PlayerInfo) {
        this.playerName = playerData.name;
        this.playerId = playerData.id;
    }

    public start() {}

    // update (dt) {}
}
