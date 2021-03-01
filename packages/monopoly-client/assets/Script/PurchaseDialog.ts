import { assertExist } from '@prisel/client';
import { monopolypb } from '@prisel/protos';
import { createDialog, DialogPosition } from './components/DialogUtils';
import { LabelConfig, LabelTheme, themeToColor } from './components/LabelConfig';
import { LayoutConfig } from './components/LayoutConfig';
import { NodeConfig } from './components/NodeConfig';
import { SpriteConfig } from './components/SpriteConfig';
import { WidgetConfig } from './components/WidgetConfig';
import { EVENT, EVENT_BUS } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PurchaseDialog extends cc.Component {
    private eventBus?: cc.Node;
    private dialog?: cc.Node;

    protected start() {
        this.eventBus = assertExist(cc.find(EVENT_BUS));
        this.eventBus.on(EVENT.PROMPT_PURCHASE, this.promptPurchase, this);
    }

    private promptPurchase(promptPurchase: monopolypb.PromptPurchaseRequest) {
        this.dialog = new cc.Node();
        this.node.addChild(this.dialog);
        createDialog({
            name: 'purchase dialog',
            title: promptPurchase.property?.name || '',
            actionText: promptPurchase.isUpgrade ? 'UPGRADE' : 'BUY',
            position: DialogPosition.BOTTOM_CENTER,
            content: NodeConfig.create('price bar')
                .setSize(new cc.Size(0, 35)) // width set by WidgetConfig
                .addComponents(
                    LayoutConfig.horizontal(10),
                    WidgetConfig.custom(undefined, 20, undefined, 20),
                )
                .addAllChildren(
                    NodeConfig.create('coin')
                        .setSize(new cc.Size(35, 35))
                        .addComponents(SpriteConfig.coin()),
                    NodeConfig.create('price label')
                        .setColor(themeToColor(LabelTheme.ON_LIGHT))
                        .addComponents(LabelConfig.p(`${promptPurchase.property?.cost || 0}`))
                        .setAnchor(cc.v2(0, 0.5)),
                ),
            onAction: this.handlePurchase.bind(this),
            onClose: this.handleCancel.bind(this),
        }).apply(this.dialog);

        cc.log(this.dialog);
    }

    private handlePurchase() {
        assertExist(this.eventBus).emit(EVENT.PURCHASE_DECISION, true);
        if (this.dialog) {
            this.node.removeChild(this.dialog);
            this.dialog = undefined;
        }
    }

    private handleCancel() {
        assertExist(this.eventBus).emit(EVENT.PURCHASE_DECISION, false);
        if (this.dialog) {
            this.node.removeChild(this.dialog);
            this.dialog = undefined;
        }
    }
}
