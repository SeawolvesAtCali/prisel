import Player from './Player';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertyTile extends cc.Component {
    @property(cc.SpriteFrame)
    private level1Sprite: cc.SpriteFrame = null;

    public onSelect: (node: cc.Node) => void;
    private owner: Player = null;
    protected start() {
        this.node.on('click', this.handleSelect, this);
    }

    private handleSelect() {
        if (this.onSelect) {
            this.onSelect(this.node);
        }
    }

    protected onDestroy() {
        this.node.off('click', this.handleSelect, this);
    }

    public setOwner(player: Player) {
        this.owner = player;
        this.getComponent(cc.Sprite).spriteFrame = this.level1Sprite;
    }

    // update (dt) {}
}
