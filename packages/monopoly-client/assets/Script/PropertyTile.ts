import Player from './Player';
import { PropertyInfo } from './packages/monopolyCommon';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertyTile extends cc.Component {
    @property(cc.SpriteAtlas)
    private spriteAtlas: cc.SpriteAtlas = null;

    private owner: Player = null;

    public getOwner() {
        return this.owner;
    }

    public setOwner(player: Player, propertyInfo: PropertyInfo) {
        this.owner = player;
        this.getComponent(cc.Sprite).spriteFrame = this.spriteAtlas.getSpriteFrame(
            `property-${this.levelString(propertyInfo)}-${player.color}`,
        );
    }

    private levelString(propertyInfo: PropertyInfo) {
        switch (propertyInfo.currentLevel) {
            case 0:
                return 'owned';
            case 1:
                return 'level-2';
            case 2:
                return 'level-3';
        }
    }
}
