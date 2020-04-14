import Player from './Player';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertyTile extends cc.Component {
    public onSelect: (node: cc.Node) => void;
    private owner: Player = null;
    protected start() {
        this.node.on('click', this.handleSelect, this);
    }

    private handleSelect() {
        cc.log('handle select', this.onSelect);
        if (this.onSelect) {
            this.onSelect(this.node);
        }
    }

    protected onDestroy() {
        this.node.off('click', this.handleSelect, this);
    }

    public setOwner(player: Player) {
        this.owner = player;
        // if (player) {
        //     this.node.color = player.color;
        // }
    }

    public restoreColor() {
        // if (this.owner) {
        //     this.node.color = this.owner.color;
        // }
        this.node.color = cc.Color.WHITE;
    }

    // update (dt) {}
}
