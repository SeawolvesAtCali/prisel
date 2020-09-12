import { Animation, AnimationArgs } from '@prisel/monopoly-common';
import { createAnimationEvent } from './animations';
import { EVENT, EVENT_BUS } from './consts';
import GameCameraControl from './GameCameraControl';
import { nullCheck, play } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChanceCardAnimation extends cc.Component {
    @property(cc.Label)
    private titleLabel: cc.Label;

    @property(cc.Label)
    private descriptionLable: cc.Label;

    @property(cc.Node)
    private card: cc.Node;

    private eventBus: cc.Node = null;

    protected start() {
        nullCheck(this.titleLabel);
        nullCheck(this.descriptionLable);
        nullCheck(this.card);

        this.eventBus = nullCheck(cc.find(EVENT_BUS));

        const confirmChance = () => {
            this.eventBus.emit(EVENT.CONFIRM_CHANCE);
        };

        createAnimationEvent('open_chance_chest').sub((anim) => {
            this.node.active = true;
            this.animate(anim);
            this.node.once('click', confirmChance);
        });

        createAnimationEvent('dismiss_chance_card').sub(() => {
            this.node.active = false;
            this.node.off(EVENT.CONFIRM_CHANCE, confirmChance);
        });
        this.node.active = false;
    }

    public animate(animation: Animation<AnimationArgs['open_chance_chest']>) {
        this.titleLabel.string = animation.args.chance.title;
        this.descriptionLable.string = animation.args.chance.description;
        this.card.position = GameCameraControl.get().tileToScreenPos(
            animation.args.chance_chest_tile,
        );

        play(this, 'chance_card_flyout', animation.length);
    }
}
