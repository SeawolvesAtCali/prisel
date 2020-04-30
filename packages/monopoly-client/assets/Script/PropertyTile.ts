import Player from './Player';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertyTile extends cc.Component {
    @property(cc.SpriteAtlas)
    private spriteAtlas: cc.SpriteAtlas = null;

    private owner: Player = null;

    public getOwner() {
        return this.owner;
    }

    public setOwner(player: Player) {
        this.owner = player;
        this.getComponent(cc.Sprite).spriteFrame = this.spriteAtlas.getSpriteFrame(
            `property-owned-${player.color}`,
        );
    }

    // update (dt) {}
}
