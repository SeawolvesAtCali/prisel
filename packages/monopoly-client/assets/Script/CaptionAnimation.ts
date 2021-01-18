import { assertExist } from '@prisel/client';
import { subscribeAnimation } from './animations';
import { play } from './utils';

const { ccclass } = cc._decorator;

@ccclass
export default class CaptionAnimation extends cc.Component {
    private label?: cc.Label;
    public animate(caption: string, durationInMs: number) {
        assertExist(this.label).string = caption;
        play(this, 'show_caption', durationInMs);
    }

    start() {
        this.label = assertExist(this.node.getComponentInChildren(cc.Label));
        this.node.active = false;
        subscribeAnimation('game_start', (anim) => {
            this.node.active = true;
            this.animate('START!', anim.length);
        });
    }
}
