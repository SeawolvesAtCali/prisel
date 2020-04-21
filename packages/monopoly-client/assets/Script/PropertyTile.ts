import Player from './Player';
import Tile from './Tile';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertyTile extends cc.Component {
    @property(cc.SpriteFrame)
    private level1Sprite: cc.SpriteFrame = null;

    public onSelect: (node: cc.Node) => void;
    private owner: Player = null;
    private touchStarted = false;
    protected start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.handleTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.cancelTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.handleSelect, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.cancelTouch, this);
    }

    private handleTouchStart() {
        this.touchStarted = true;
    }

    private cancelTouch() {
        this.touchStarted = false;
    }

    private handleSelect() {
        if (!this.touchStarted) {
            return;
        }
        this.touchStarted = false;
        if (this.onSelect) {
            const tilePos = this.getComponent(Tile).getTile().pos;
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
