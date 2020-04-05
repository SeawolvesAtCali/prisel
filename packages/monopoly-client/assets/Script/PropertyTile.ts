const { ccclass, property } = cc._decorator;

@ccclass
export default class PropertyTile extends cc.Component {
    public onSelect: (node: cc.Node) => void;

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

    // update (dt) {}
}
