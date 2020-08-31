import { createAnimationEvent } from './animations';
import { EVENT_BUS } from './consts';
import { nullCheck } from './utils';

const { ccclass } = cc._decorator;

@ccclass
export default class CaptionAnimation extends cc.Component {
    private label: cc.Label;
    private anim: cc.Animation;
    private eventBus: cc.Node;
    public animate(caption: string, durationInMs: number) {
        this.label.string = caption;
        const animState = this.anim.play('show_caption');
        const originalDuration = animState.duration;
        animState.speed = (originalDuration * 1000) / durationInMs;
    }

    start() {
        this.label = nullCheck(this.node.getComponentInChildren(cc.Label));
        this.anim = nullCheck(this.label.getComponent(cc.Animation));
        this.node.active = false;
        this.eventBus = nullCheck(cc.find(EVENT_BUS));
        createAnimationEvent('game_start').sub((anim) => {
            this.node.active = true;
            this.animate('START!', anim.length);
        });
    }
}
