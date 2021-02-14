import { assertExist } from '@prisel/client';
import { Anim } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { subscribeAnimation } from './animations';
import { LabelConfig, LabelTheme, themeToColor } from './components/LabelConfig';
import { LayoutConfig } from './components/LayoutConfig';
import { NodeConfig } from './components/NodeConfig';
import { SpriteConfig } from './components/SpriteConfig';
import { WidgetConfig } from './components/WidgetConfig';
import { EVENT, EVENT_BUS } from './consts';
import GameCameraControl from './GameCameraControl';
import { play } from './utils';

const { ccclass, property } = cc._decorator;

function createCard(title: string, description: string) {
    const root = NodeConfig.create('Card'); // "Card" matches the name in chance_card_flyout.anim
    root.setSize(new cc.Size(300, 500)).addComponents(
        SpriteConfig.panel(),
        LayoutConfig.vertical(10, 17.9, 0),
    );
    root.addChild('Title').setColor(themeToColor(LabelTheme.ON_LIGHT)).addComponents(
        WidgetConfig.horizontalContraint(0, 0), // top is controlled by root container.
        LabelConfig.h1(title).setOverflow(cc.Label.Overflow.RESIZE_HEIGHT),
    );
    root.addChild('Description')
        .setColor(themeToColor(LabelTheme.ON_LIGHT))
        .addComponents(
            WidgetConfig.horizontalContraint(10, 10),
            LabelConfig.p(description).setOverflow(cc.Label.Overflow.RESIZE_HEIGHT),
        );
    return root;
}
@ccclass
export default class ChanceCardAnimation extends cc.Component {
    @property(cc.Node)
    private card?: cc.Node;

    @property(cc.Node)
    private dropShadow?: cc.Node;

    private eventBus?: cc.Node;

    protected start() {
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
            if (this.dropShadow) {
                this.dropShadow.active = true;
            }
            if (this.card) {
                this.card.active = true;
                const card = createCard(
                    openChanceChestExtra.chance?.title || 'untitled',
                    openChanceChestExtra.chance?.description || 'undescribed',
                ).apply(this.card);
                const cardPos = GameCameraControl.get().tileToScreenPos(
                    assertExist(openChanceChestExtra.chanceChestTile),
                );
                if (cardPos) {
                    card.position = cardPos;
                }
            }
            play(this, 'chance_card_flyout', animation.length);
        }
    }
}
