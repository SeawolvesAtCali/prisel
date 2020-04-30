import { EVENT_BUS, EVENT } from './consts';
import {
    Encounter,
    PropertyForPurchaseEncounter,
    PromptPurchasePayload,
} from './packages/monopolyCommon';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PurchaseDialog extends cc.Component {
    @property(cc.Label)
    private propertyNameLabel: cc.Label = null;

    @property(cc.Button)
    private purchaseButton: cc.Button = null;

    @property(cc.Button)
    private noButton: cc.Button = null;

    @property(cc.Label)
    private propertyPriceLabel: cc.Label = null;

    private eventBus: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() {
        this.eventBus = cc.find(EVENT_BUS);
        this.node.active = false;
        this.eventBus.on(EVENT.PROMPT_PURCHASE, this.promptPurchase, this);
        this.purchaseButton.node.on(cc.Node.EventType.TOUCH_END, this.handlePurchase, this);
        this.noButton.node.on(cc.Node.EventType.TOUCH_END, this.handleCancel, this);
    }

    private promptPurchase(promptPurchase: PromptPurchasePayload) {
        this.node.active = true;
        // reset the button to normal state.
        this.purchaseButton.getComponentInChildren(
            cc.Sprite,
        ).spriteFrame = this.purchaseButton.normalSprite;
        this.propertyNameLabel.string = promptPurchase.property.name;
        this.propertyPriceLabel.string = `${promptPurchase.property.cost}`;
    }

    private handlePurchase() {
        this.eventBus.emit(EVENT.PURCHASE_DECISION, true);
        this.node.active = false;
    }

    private handleCancel() {
        this.eventBus.emit(EVENT.PURCHASE_DECISION, false);
        this.node.active = false;
    }

    // update (dt) {}
}
