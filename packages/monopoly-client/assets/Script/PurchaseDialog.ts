import { EVENT_BUS, EVENT } from './consts';
import {
    Encounter,
    PropertyForPurchaseEncounter,
    PromptPurchasePayload,
} from './packages/monopolyCommon';
import Dialog from './Dialog';
import { nullCheck } from './utils';
import { createDialog, DialogPosition } from './components/Dialog';
import { NodeConfig } from './components/NodeConfig';
import { WidgetConfig } from './components/WidgetConfig';
import { SpriteConfig } from './components/SpriteConfig';
import { LayoutConfig } from './components/LayoutConfig';
import { LabelConfig, themeToColor, LabelTheme } from './components/LabelConfig';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PurchaseDialog extends cc.Component {
    private eventBus: cc.Node = null;
    private dialog: cc.Node = null;

    protected start() {
        this.eventBus = cc.find(EVENT_BUS);

        this.eventBus.on(EVENT.PROMPT_PURCHASE, this.promptPurchase, this);
    }

    private promptPurchase(promptPurchase: PromptPurchasePayload) {
        this.dialog = new cc.Node();
        this.node.addChild(this.dialog);
        createDialog({
            name: 'purchase dialog',
            title: promptPurchase.property.name,
            actionText: 'BUY',
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
                        .addComponents(LabelConfig.p(`${promptPurchase.property.cost}`))
                        .setAnchor(cc.v2(0, 0.5)),
                ),
            onAction: this.handlePurchase.bind(this),
            onClose: this.handleCancel.bind(this),
        }).apply(this.dialog);

        cc.log(this.dialog);
    }

    private handlePurchase() {
        this.eventBus.emit(EVENT.PURCHASE_DECISION, true);
        this.node.removeChild(this.dialog);
        this.dialog = undefined;
    }

    private handleCancel() {
        this.eventBus.emit(EVENT.PURCHASE_DECISION, false);
        this.node.removeChild(this.dialog);
        this.dialog = undefined;
    }
}
