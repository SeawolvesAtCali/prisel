import { EVENT_BUS, EVENT } from './consts';
import {
    Encounter,
    PropertyForPurchaseEncounter,
    PromptPurchasePayload,
} from './packages/monopolyCommon';
import Dialog from './Dialog';
import { nullCheck } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PurchaseDialog extends cc.Component {
    @property(cc.Label)
    private propertyPriceLabel: cc.Label = null;

    private eventBus: cc.Node = null;
    private dialog: Dialog = null;

    protected start() {
        this.eventBus = cc.find(EVENT_BUS);
        this.dialog = nullCheck(this.getComponent(Dialog));
        this.node.active = false;
        this.eventBus.on(EVENT.PROMPT_PURCHASE, this.promptPurchase, this);
    }

    private promptPurchase(promptPurchase: PromptPurchasePayload) {
        this.node.active = true;
        this.dialog.setTitle(promptPurchase.property.name);
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
}
