import { playAnimation } from './utils';
import { EVENT_BUS, EVENT } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dice extends cc.Component {
    @property(cc.SpriteFrame)
    private pointSprites: cc.SpriteFrame[] = [];
    private value: 1 | 2 | 3 | 4 | 5 | 6;
    private sprite: cc.Sprite = null;
    private eventBus: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() {
        this.sprite = this.getComponent(cc.Sprite);
        this.eventBus = cc.find(EVENT_BUS);
        this.eventBus.on(EVENT.DICE_ROLLED_RESPONSE, this.setValue, this);
    }

    // called by animation event, set through timeline editor
    public updateSprite() {
        this.sprite.spriteFrame = this.pointSprites[this.value - 1];
    }

    public setValue(num: number) {
        if (num === 1 || num === 2 || num === 3 || num === 4 || num === 5 || num === 6) {
            this.value = num;
            return;
        }
        cc.log('cannot set dice value to ' + num);
    }

    public playRollAnimation() {
        return playAnimation(this.node, 'dice_roll');
    }

    // update (dt) {}
}
