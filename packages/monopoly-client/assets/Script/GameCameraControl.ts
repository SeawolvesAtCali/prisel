import { toVec2 } from './utils';
import { AUTO_PANNING_PX_PER_SECOND } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCameraControl extends cc.Component {
    private followingNode: cc.Node = null;
    private resolveMoveToNode: (value?: void | PromiseLike<void>) => void = null;
    private moveToNodeTween: cc.Tween = null;
    private offset: cc.Vec2 = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() {}

    public startFollowing(node: cc.Node, offset?: cc.Vec2) {
        if (this.moveToNodeTween) {
            this.moveToNodeTween.stop();
            this.moveToNodeTween = null;
        }
        if (this.resolveMoveToNode) {
            this.resolveMoveToNode();
            this.resolveMoveToNode = null;
        }
        this.followingNode = node;
        this.offset = offset;
    }
    public stopFollowing() {
        this.followingNode = null;
    }

    private getTargetPositionInParentSpace(target: cc.Node): cc.Vec2 {
        const targetPos = target.parent.convertToWorldSpaceAR(target.position);
        return toVec2(this.node.parent.convertToNodeSpaceAR(targetPos));
    }
    protected lateUpdate(dt: number) {
        if (this.followingNode) {
            const cameraPos = this.offset
                ? this.getTargetPositionInParentSpace(this.followingNode).add(this.offset)
                : this.getTargetPositionInParentSpace(this.followingNode);

            this.node.setPosition(cameraPos);
        }
    }

    public moveToNode(node: cc.Node, offset?: cc.Vec2): Promise<void> {
        if (this.followingNode) {
            this.followingNode = null;
        }

        const targetPos = offset
            ? this.getTargetPositionInParentSpace(node).add(offset)
            : this.getTargetPositionInParentSpace(node);
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
