import { toVec2, lifecycle } from './utils';
import { AUTO_PANNING_PX_PER_SECOND, CAMERA_FOLLOW_OFFSET } from './consts';
import { Anim, samePos } from './packages/monopolyCommon';
import { createAnimationEvent, animEmitter } from './animations';

import Game from './Game';
import Player from './Player';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCameraControl extends cc.Component {
    private followingNode: cc.Node = null;
    private resolveMoveToNode: (value?: void | PromiseLike<void>) => void = null;
    private moveToNodeTween: cc.Tween = null;
    private offset: cc.Vec2 = null;

    @lifecycle
    protected start() {
        createAnimationEvent('pan').sub(animEmitter, (anim) => {
            const playerAtTile = Game.get()
                .getPlayerNodes()
                .find((node) => {
                    const player = node.getComponent(Player);
                    if (!player) {
                        cc.error('player node does not have Player component', player);
                        return false;
                    }
                    if (!player.pos) {
                        cc.error('player node does not have pos', player);
                        return false;
                    }
                    return samePos(player.pos, anim.args.target);
                });
            if (playerAtTile) {
                this.moveToNode(playerAtTile, CAMERA_FOLLOW_OFFSET, anim.length);
            } else {
                cc.error('cannot find player at position ', anim.args.target);
            }
        });
        createAnimationEvent('move').sub(animEmitter, async (anim) => {
            const currentGamePlayerNode = Game.get().getPlayerNode(anim.args.player.player.id);
            if (currentGamePlayerNode) {
                this.startFollowing(currentGamePlayerNode);
                await Anim.wait(anim).promise;
                this.stopFollowing();
                this.moveToNode(currentGamePlayerNode);
            }
        });
    }

    public startFollowing(node: cc.Node, offset: cc.Vec2 = CAMERA_FOLLOW_OFFSET) {
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

    @lifecycle
    protected lateUpdate(dt: number) {
        if (this.followingNode) {
            const cameraPos = this.offset
                ? this.getTargetPositionInParentSpace(this.followingNode).add(this.offset)
                : this.getTargetPositionInParentSpace(this.followingNode);

            this.node.setPosition(cameraPos);
        }
    }

    public moveToNode(
        node: cc.Node,
        offset: cc.Vec2 = CAMERA_FOLLOW_OFFSET,
        durationInMs?: number,
    ): Promise<void> {
        if (this.followingNode) {
            this.followingNode = null;
        }
        const targetPos = offset
            ? this.getTargetPositionInParentSpace(node).add(offset)
            : this.getTargetPositionInParentSpace(node);
        const distance = targetPos.sub(this.node.position).mag();
        const duration =
            durationInMs === undefined
                ? distance / AUTO_PANNING_PX_PER_SECOND
                : durationInMs / 1000;
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
