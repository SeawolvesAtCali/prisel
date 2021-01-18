import { assertExist } from '@prisel/client';
import { monopolypb } from '@prisel/protos';
import { LANDING_POS_OFFSET, PROPERTY_Z_INDEX_OFFSET } from './consts';
import Player from './Player';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertyTile extends cc.Component {
    @property(cc.SpriteAtlas)
    private spriteAtlas?: cc.SpriteAtlas;

    @property(cc.Prefab)
    private particle?: cc.Prefab;

    private owner?: Player;

    public coor?: monopolypb.Coordinate;

    public init(coor: monopolypb.Coordinate) {
        this.coor = coor;
    }

    public getZIndex() {
        return assertExist(this.coor).row * 10 + PROPERTY_Z_INDEX_OFFSET;
    }
    public getOwner() {
        return this.owner;
    }

    public setOwner(player: Player, propertyInfo: monopolypb.PropertyInfo) {
        this.owner = player;
        this.getComponent(cc.Sprite).spriteFrame = assertExist(this.spriteAtlas).getSpriteFrame(
            `property-${this.levelString(propertyInfo)}-${player.color}`,
        );
    }

    private levelString(propertyInfo: monopolypb.PropertyInfo) {
        switch (propertyInfo.currentLevel) {
            case 0:
                return 'owned';
            case 1:
                return 'level-2';
            case 2:
                return 'level-3';
        }
    }

    public playInvestedEffect(durationInMs?: number) {
        const particleNode = (cc.instantiate(assertExist(this.particle)) as unknown) as cc.Node;
        this.node.addChild(particleNode);
        particleNode.setPosition(LANDING_POS_OFFSET);
    }
}
