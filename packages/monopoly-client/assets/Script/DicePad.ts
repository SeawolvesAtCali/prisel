// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Dice from './Dice';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DicePad extends cc.Component {
    private dice: Dice;
    private diceShadowNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() {
        this.dice = this.getComponentInChildren(Dice);
        this.diceShadowNode = this.node.getChildByName('dice_shadow');
        this.node.on(cc.Node.EventType.TOUCH_START, this.roll, this);
    }

    private roll() {
        this.dice.playRollAnimation().then(() => {
            this.dice.setValue(5);
            this.dice.updateSprite();
        });
    }

    // update (dt) {}
}
