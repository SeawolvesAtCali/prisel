import { PromptPurchasePayload } from '@prisel/monopoly-common';
import { EVENT, EVENT_BUS } from './consts';
import MapLoader from './MapLoader';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertySelector extends cc.Component {
    @property(MapLoader)
    private map: MapLoader = null;

    @property(cc.Animation)
    private headAnimation: cc.Animation = null;

    @property(cc.Animation)
    private shadowAnimation: cc.Animation = null;

    private eventBus: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() {
        this.eventBus = cc.find(EVENT_BUS);
        this.eventBus.on(EVENT.PROMPT_PURCHASE, this.handlePropertyForPurchase, this);
        this.eventBus.on(EVENT.PURCHASE_DECISION, this.handleHide, this);
        this.node.active = false;
    }

    private handlePropertyForPurchase(promptPurchasePayload: PromptPurchasePayload) {
        this.node.active = true;
        this.headAnimation.play();
        this.shadowAnimation.play();
        this.map.moveToPos(this.node, promptPurchasePayload.property.pos);
    }

    private handleHide() {
        this.node.active = false;
    }

    // update (dt) {}
}
