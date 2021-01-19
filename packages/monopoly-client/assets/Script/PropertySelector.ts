import { exist } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { EVENT, EVENT_BUS } from './consts';
import MapLoader from './MapLoader';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertySelector extends cc.Component {
    @property(MapLoader)
    private map?: MapLoader;

    @property(cc.Animation)
    private headAnimation?: cc.Animation;

    @property(cc.Animation)
    private shadowAnimation?: cc.Animation;

    private eventBus?: cc.Node;

    protected start() {
        this.eventBus = cc.find(EVENT_BUS);
        this.eventBus.on(EVENT.PROMPT_PURCHASE, this.handlePropertyForPurchase, this);
        this.eventBus.on(EVENT.PURCHASE_DECISION, this.handleHide, this);
        this.node.active = false;
    }

    private handlePropertyForPurchase(promptPurchasePayload: monopolypb.PromptPurchaseRequest) {
        this.node.active = true;
        this.headAnimation?.play();
        this.shadowAnimation?.play();
        const propertyPos = promptPurchasePayload.property?.pos;
        if (exist(propertyPos)) {
            this.map?.moveToPos(this.node, propertyPos);
        }
    }

    private handleHide() {
        this.node.active = false;
    }

    // update (dt) {}
}
