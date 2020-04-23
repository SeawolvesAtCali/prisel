// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EVENT_BUS, EVENT } from './consts';
import { PropertyForPurchaseEncounter } from './packages/monopolyCommon';
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
        this.eventBus.on(EVENT.CANCEL_PURCHASE, this.handleHide, this);
        this.eventBus.on(EVENT.PURCHASE, this.handleHide, this);
        this.node.active = false;
    }

    private handlePropertyForPurchase(propertyForPurchaseEncounter: PropertyForPurchaseEncounter) {
        this.node.active = true;
        this.headAnimation.play();
        this.shadowAnimation.play();
        this.map.moveToPos(this.node, propertyForPurchaseEncounter.properties[0].pos);
    }

    private handleHide() {
        this.node.active = false;
    }

    // update (dt) {}
}
