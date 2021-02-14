import { assertExist } from '@prisel/client';
import { Anim, exist } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { subscribeAnimation } from './animations';
import {
    AUTO_PANNING_PX_PER_SECOND,
    CAMERA_FOLLOW_OFFSET,
    LANDING_POS_OFFSET,
    TILE_CENTER_OFFSET,
} from './consts';
import Game from './Game';
import MapLoader from './MapLoader';
import { lifecycle, toVec2 } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCameraControl extends cc.Component {
    private followingNode?: cc.Node;
    private resolveMoveToNode?: (value?: void | PromiseLike<void>) => void;
    private moveToNodeTween?: cc.Tween;
    private offset?: cc.Vec2;

    private static instance?: GameCameraControl;

    public static get() {
        return assertExist(GameCameraControl.instance, 'GameCameraControl');
    }

    @lifecycle
    protected onLoad() {
        GameCameraControl.instance = this;
    }

    @lifecycle
    protected onDestroy() {
        GameCameraControl.instance = undefined;
    }

    @lifecycle
    protected start() {
        subscribeAnimation('pan', (anim) => {
            const panExtra = Anim.getExtra(anim, monopolypb.PanExtra);
            if (panExtra && panExtra.target) {
                this.moveToTileAtPos(panExtra.target, anim.length);
            }
        });
        subscribeAnimation('move', async (anim) => {
            const moveExtra = Anim.getExtra(anim, monopolypb.MoveExtra);
            if (moveExtra) {
                const playerId = moveExtra.player?.id;

                const currentGamePlayerNode = exist(playerId)
                    ? Game.get().getPlayerNode(playerId)
                    : null;
                if (currentGamePlayerNode) {
                    this.startFollowing(currentGamePlayerNode);
                    await Anim.wait(anim);
                    this.stopFollowing();
                    this.moveToTileAtPos(moveExtra.path.slice(-1)[0]);
                }
            }
        });
    }

    private moveToTileAtPos(pos: monopolypb.Coordinate, durationInMs?: number) {
        const targetTile = MapLoader.get().getTile(pos);
        if (pos && targetTile) {
            this.moveToNode(
                targetTile.node,
                CAMERA_FOLLOW_OFFSET.add(LANDING_POS_OFFSET),
                durationInMs,
            );
        }
    }

    /**
     * Convert tile coordinate to canvas position
     * @param tile Coordinate of the tile
     */
    public tileToScreenPos(tile: monopolypb.Coordinate): cc.Vec2 | null {
        const tileComp = MapLoader.get().getTile(tile);
        if (tileComp) {
            return toVec2(
                this.getComponent(cc.Camera).getWorldToScreenPoint(
                    tileComp.node.position.add(TILE_CENTER_OFFSET),
                ),
            );
        }
        return null;
    }

    public startFollowing(node: cc.Node, offset: cc.Vec2 = CAMERA_FOLLOW_OFFSET) {
        if (this.moveToNodeTween) {
            this.moveToNodeTween.stop();
            this.moveToNodeTween = undefined;
        }
        if (this.resolveMoveToNode) {
            this.resolveMoveToNode();
            this.resolveMoveToNode = undefined;
        }
        this.followingNode = node;
        this.offset = offset;
    }

    public stopFollowing() {
        this.followingNode = undefined;
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
            this.followingNode = undefined;
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
                    this.moveToNodeTween = undefined;
                    this.resolveMoveToNode = undefined;
                    resolve();
                })
                .start();
        });
    }
}
