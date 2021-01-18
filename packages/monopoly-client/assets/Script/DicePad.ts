import { EVENT, EVENT_BUS } from './consts';
import Dice from './Dice';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DicePad extends cc.Component {
    private dice?: Dice;
    private eventBus?: cc.Node;
    private rolled = false;

    // LIFE-CYCLE CALLBACKS:

    protected start() {
        this.eventBus = cc.find(EVENT_BUS);
        this.dice = this.getComponentInChildren(Dice);
        this.node.on(cc.Node.EventType.TOUCH_START, this.roll, this);
        this.eventBus.on(EVENT.START_CURRENT_PLAYER_TURN, () => {
            cc.log('start turn');
            this.node.active = true;
            this.rolled = false;
        });
        this.eventBus.on(EVENT.END_CURRENT_PLAYER_TURN, () => {
            cc.log('end turn');
            this.node.active = false;
        });
        this.node.active = false;
    }

    private roll() {
        if (this.rolled) {
            return;
        }
        this.eventBus?.emit(EVENT.DICE_ROLLED);
        this.rolled = true;
        this.dice?.playRollAnimation().then(() => {
            // hopefully when animation ends, dice already receive event to
            // update the value.
            this.dice?.updateSprite();
            this.eventBus?.emit(EVENT.DICE_ROLLED_END);
        });
    }

    // update (dt) {}
}
