import Dice from './Dice';
import { EVENT_BUS, EVENT } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DicePad extends cc.Component {
    private dice: Dice;
    private eventBus: cc.Node = null;
    private rolled = false;

    // LIFE-CYCLE CALLBACKS:

    protected onLoad() {
        cc.log('dice pad loaded');
    }

    protected start() {
        cc.log('dice pad started');
        this.eventBus = cc.find(EVENT_BUS);
        this.dice = this.getComponentInChildren(Dice);
        this.node.on(cc.Node.EventType.TOUCH_START, this.roll, this);
        this.eventBus.on(EVENT.START_CURRENT_PLAYER_TURN, () => {
            this.node.active = true;
            cc.log('activate dice pad');
            this.rolled = false;
        });
        this.eventBus.on(EVENT.END_CURRENT_PLAYER_TURN, () => {
            this.node.active = false;
            cc.log('diactivate dice pad');
        });
        cc.log('setting dice pad inactive');
        this.node.active = false;
    }

    private roll() {
        if (this.rolled) {
            return;
        }
        this.eventBus.emit(EVENT.DICE_ROLLED);
        this.rolled = true;
        this.dice.playRollAnimation().then(() => {
            // hopefully when animation ends, dice already receive event to
            // update the value.
            this.dice.updateSprite();
            cc.log('emit rolled end');
            this.eventBus.emit(EVENT.DICE_ROLLED_END);
        });
    }

    // update (dt) {}
}
