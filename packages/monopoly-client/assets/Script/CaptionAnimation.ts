import { createAnimationEvent } from './animations';
import { nullCheck, play } from './utils';

const { ccclass } = cc._decorator;

@ccclass
export default class CaptionAnimation extends cc.Component {
    private label: cc.Label;
    public animate(caption: string, durationInMs: number) {
        this.label.string = caption;
        play(this, 'show_caption', durationInMs);
    }

    start() {
        this.label = nullCheck(this.node.getComponentInChildren(cc.Label));
        this.node.active = false;
        createAnimationEvent('game_start').sub((anim) => {
            this.node.active = true;
            this.animate('START!', anim.length);
        });
    }
}
