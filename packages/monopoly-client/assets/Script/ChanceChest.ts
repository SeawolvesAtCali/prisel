import { Mixins } from '@prisel/monopoly-common';
import TileWrapper from './Tile';
import { lifecycle, nullCheck } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChanceChest extends cc.Component {
    @property(cc.Node)
    private chestNode: cc.Node = null;

    @lifecycle
    protected start() {
        nullCheck(this.chestNode).active = !!Mixins.hasMixin(
            nullCheck(this.getComponent(TileWrapper)).getTile(),
            Mixins.ChancePoolMixinConfig,
        );
    }
}
