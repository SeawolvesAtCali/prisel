const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockEvent extends cc.Component {
    protected start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.hijackEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.hijackEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.hijackEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.hijackEvent, this);
        this.node.on(cc.Node.EventType.MOUSE_ENTER, this.hijackEvent, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.hijackEvent, this);
    }

    private hijackEvent(e: cc.Event) {
        e.stopPropagation();
    }
}
