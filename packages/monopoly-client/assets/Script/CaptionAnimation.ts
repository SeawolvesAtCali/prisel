import { nullCheck, getGame } from './utils';
import { EVENT_BUS, EVENT } from './consts';
import { Animation, AnimationName } from '@prisel/monopoly-common';

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
        this.eventBus.on(EVENT.ANIMATION, (anim: Animation) => {
            switch (anim.name as AnimationName) {
                case 'game_start':
                    this.node.active = true;
                    this.animate('START!', anim.length);
                    break;
                case 'dice_down':
                    this.node.active = true;
                    this.animate(
                        '' + getGame().currentGamePlayer.playerRollPayload.steps,
                        anim.length,
                    );
                    break;
            }
        });
    }
}
