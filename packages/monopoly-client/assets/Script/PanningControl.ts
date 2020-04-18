import Pannable from './Pannable';

const { ccclass, property } = cc._decorator;

// controls panning of the children.
@ccclass
export default class PanningControl extends cc.Component {
    private touchId: number = null;

    // onLoad () {}

    protected start() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.handleTouchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.handlePanningFinished, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.handleTouchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.handlePanningFinished, this, true);

        // position the content if it cannot be panned in one axis
    }

    private handleTouchStart(event: cc.Event.EventTouch) {
        // only support single touch panning.
        if (this.touchId !== null) {
            return;
        }
        this.touchId = event.getID();
        // record child original position
        this.getComponentsInChildren(Pannable).forEach((pannable) => pannable.startMove());
    }

    private handlePanningFinished(event: cc.Event.EventTouch) {
        if (event.getID() === this.touchId) {
            this.touchId = null;
            this.getComponentsInChildren(Pannable).forEach((pannable) => pannable.stopMove());
        }
    }

    private handleTouchMove(event: cc.Event.EventTouch) {
        if (event.getID() !== this.touchId) {
            return;
        }

        const delta = event.getLocation().sub(event.getStartLocation());
        this.getComponentsInChildren(Pannable).forEach((pannable) =>
            pannable.moveBy(delta, this.node),
        );
    }

    // update (dt) {}
}
