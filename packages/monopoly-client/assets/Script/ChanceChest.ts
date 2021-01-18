import { assertExist } from '@prisel/client';
import { exist } from '@prisel/monopoly-common';
import TileWrapper from './Tile';
import { lifecycle } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChanceChest extends cc.Component {
    @property(cc.Node)
    private chestNode?: cc.Node;

    @lifecycle
    protected start() {
        assertExist(this.chestNode).active = exist(
            this.getComponent(TileWrapper).getTile()?.chancePool,
        );
    }
}
