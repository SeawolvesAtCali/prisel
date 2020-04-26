import { EVENT_BUS, EVENT } from './consts';
import { Encounter, PropertyForPurchaseEncounter } from './packages/monopolyCommon';

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
    private purchaseEncounter: PropertyForPurchaseEncounter = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() {
        this.eventBus = cc.find(EVENT_BUS);
        this.node.active = false;
        this.eventBus.on(EVENT.PROMPT_PURCHASE, this.promptPurchase, this);
        this.purchaseButton.node.on(cc.Node.EventType.TOUCH_END, this.handlePurchase, this);
        this.noButton.node.on(cc.Node.EventType.TOUCH_END, this.handleCancel, this);
    }

    private promptPurchase(purchaseEncounter: PropertyForPurchaseEncounter) {
        this.node.active = true;
        // reset the button to normal state.
        this.purchaseButton.getComponentInChildren(
            cc.Sprite,
        ).spriteFrame = this.purchaseButton.normalSprite;
        this.purchaseEncounter = purchaseEncounter;
        this.propertyNameLabel.string = this.purchaseEncounter.properties[0].name;
        this.propertyPriceLabel.string = `${this.purchaseEncounter.properties[0].cost}`;
    }

    private handlePurchase() {
        this.eventBus.emit(EVENT.PURCHASE_DECISION, this.purchaseEncounter);
        this.node.active = false;
    }

    private handleCancel() {
        this.eventBus.emit(EVENT.PURCHASE_DECISION);
        this.node.active = false;
    }

    // update (dt) {}
}
