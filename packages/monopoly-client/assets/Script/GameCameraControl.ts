import { toVec2 } from './utils';
import { AUTO_PANNING_PX_PER_SECOND } from './consts';

const { ccclass, property } = cc._decorator;

const FOLLOWING_THRESHOLD = 20;
@ccclass
export default class GameCameraControl extends cc.Component {
    private followingNode: cc.Node = null;
    private resolveMoveToNode: (value?: void | PromiseLike<void>) => void = null;
    private moveToNodeTween: cc.Tween = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() {}

    public startFollowing(node: cc.Node) {
        if (this.moveToNodeTween) {
            this.moveToNodeTween.stop();
            this.moveToNodeTween = null;
        }
        if (this.resolveMoveToNode) {
            this.resolveMoveToNode();
            this.resolveMoveToNode = null;
        }
        this.followingNode = node;
    }
    public stopFollowing() {
        this.followingNode = null;
    }

    private getTargetPositionInParentSpace(target: cc.Node) {
        const targetPos = target.parent.convertToWorldSpaceAR(target.position);
        return this.node.parent.convertToNodeSpaceAR(targetPos);
    }
    protected lateUpdate(dt: number) {
        if (this.followingNode) {
            this.node.setPosition(this.getTargetPositionInParentSpace(this.followingNode));
        }
    }

    public moveToNode(node: cc.Node): Promise<void> {
        if (this.followingNode) {
            this.followingNode = null;
        }

        const targetPos = toVec2(this.getTargetPositionInParentSpace(node));
        const distance = targetPos.sub(this.node.position).mag();
        const duration = distance / AUTO_PANNING_PX_PER_SECOND;
        return new Promise((resolve) => {
            this.resolveMoveToNode = resolve;
            this.moveToNodeTween = cc
                .tween(this.node)
                .to(duration, { position: targetPos }, { easing: 'sineInOut' })
                .call(() => {
                    this.moveToNodeTween = null;
                    this.resolveMoveToNode = null;
                    resolve();
                })
                .start();
        });
    }
}
