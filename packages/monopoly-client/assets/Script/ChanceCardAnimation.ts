import { assertExist } from '@prisel/client';
import { Anim } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { subscribeAnimation } from './animations';
import { EVENT, EVENT_BUS } from './consts';
import GameCameraControl from './GameCameraControl';
import { play } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChanceCardAnimation extends cc.Component {
    @property(cc.Label)
    private titleLabel?: cc.Label;

    @property(cc.Label)
    private descriptionLable?: cc.Label;

    @property(cc.Node)
    private card?: cc.Node;

    private eventBus?: cc.Node;

    protected start() {
        assertExist(this.titleLabel);
        assertExist(this.descriptionLable);
        assertExist(this.card);

        this.eventBus = assertExist(cc.find(EVENT_BUS));

        const confirmChance = () => {
            this.eventBus?.emit(EVENT.CONFIRM_CHANCE);
        };

        subscribeAnimation('open_chance_chest', (anim) => {
            this.node.active = true;
            this.animateOpenChanceChest(anim);
            this.node.once('click', confirmChance);
        });

        subscribeAnimation('dismiss_chance_card', () => {
            this.node.active = false;
            this.node.off(EVENT.CONFIRM_CHANCE, confirmChance);
        });
        this.node.active = false;
    }

    public animateOpenChanceChest(animation: monopolypb.Animation) {
        const openChanceChestExtra = Anim.getExtra(animation, monopolypb.OpenChanceChestExtra);
        if (openChanceChestExtra) {
            assertExist(this.titleLabel).string = openChanceChestExtra.chance?.title || 'untitled';
            assertExist(this.descriptionLable).string =
                openChanceChestExtra.chance?.description || 'undescribed';
            const cardPost = GameCameraControl.get().tileToScreenPos(
                assertExist(openChanceChestExtra.chanceChestTile),
            );
            if (cardPost) {
                assertExist(this.card).position = cardPost;
            }

            play(this, 'chance_card_flyout', animation.length);
        }
    }
}
