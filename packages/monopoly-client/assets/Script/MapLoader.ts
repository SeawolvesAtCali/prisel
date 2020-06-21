import {
    isRoadTile,
    isStartTile,
    isPropertyTile,
    BoardSetup,
    Tile,
    StartTile,
    Coordinate,
} from './packages/monopolyCommon';

import { default as TileComponent } from './Tile';
import {
    getTileKey,
    getTileKeyFromCoordinate,
    setZIndexAction,
    callOnMoveAction,
    lifecycle,
} from './utils';
import { TILE_SIZE, EVENT_BUS } from './consts';
import PropertyTile from './PropertyTile';
import { createAnimationEvent, animEmitter } from './animations';
const { ccclass, property } = cc._decorator;

// TODO: reposition this to be Map component, that handles only rendering map
// and providing map related info.
@ccclass
export default class MapLoader extends cc.Component {
    @property(cc.Prefab)
    private emptyTile = null;

    @property(cc.Prefab)
    private roadTile = null;

    @property(cc.Prefab)
    private propertyTile = null;

    @property(cc.Prefab)
    private startTile = null;

    private startTiles: StartTile[] = null;

    private tileMap: Map<string, TileComponent> = null;

    public selectedPropertyTile: cc.Node = null;

    public mapHeightInPx = 0;
    public mapWidthInPx = 0;
    private tilePositionOffset: cc.Vec2 = null;

    private static instance: MapLoader;

    public static get() {
        return MapLoader.instance;
    }

    @lifecycle
    protected onLoad() {
        MapLoader.instance = this;
    }

    @lifecycle
    protected onDestroy() {
        MapLoader.instance = undefined;
    }

    public renderMap(boardSetup: BoardSetup) {
        if (!this.emptyTile || !this.roadTile || !this.propertyTile || !this.startTile) {
            cc.log('Tile prefabs not set');
            return;
        }
        const { tiles, height, width, roadPropertyMapping } = boardSetup;
        this.mapHeightInPx = height * TILE_SIZE;
        this.mapWidthInPx = width * TILE_SIZE;
        this.tilePositionOffset = cc.v2(-this.mapWidthInPx / 2, this.mapHeightInPx / 2);
        this.node.setContentSize(this.mapWidthInPx, this.mapHeightInPx);

        this.startTiles = [];
        this.tileMap = new Map();

        for (const tile of tiles) {
            if (isRoadTile(tile)) {
                this.renderTile(this.roadTile, tile);
            } else if (isStartTile(tile)) {
                this.startTiles.push(tile);
                this.renderTile(this.startTile, tile);
            } else if (isPropertyTile(tile)) {
                this.renderTile(this.propertyTile, tile);
            } else {
                // assume it is unspecified tile
                this.renderTile(this.emptyTile, tile);
            }
        }
        createAnimationEvent('invested').sub(animEmitter, (anim) => {
            const property = this.getPropertyTileAt(anim.args.property.pos);
            if (property) {
                property.playInvestedEffect(anim.length);
            }
        });
    }

    private renderTile(tilePrefab: cc.Prefab, tile: Tile) {
        const tileNode = cc.instantiate(tilePrefab);
        const tileComp = tileNode.getComponent(TileComponent);
        if (!tileComp) {
            throw new Error("current tile doesn't have Tile script attached");
        }
        tileComp.init(tile);
        this.node.addChild(tileNode, tileComp.getZIndex());
        tileNode.setPosition(this.tilePositionOffset.add(tileComp.getInitialAnchorPos()));
        this.tileMap.set(getTileKey(tile), tileComp);

        return tileNode;
    }

    public getStartTiles(): StartTile[] {
        return this.startTiles;
    }

    public getPropertyTileAt(pos: Coordinate): PropertyTile {
        const node = this.tileMap.get(getTileKeyFromCoordinate(pos));
        if (node) {
            return node.getComponent(PropertyTile);
        }
    }

    public getTile(pos: Coordinate): TileComponent {
        return this.tileMap.get(getTileKeyFromCoordinate(pos));
    }
    // position node at the tile. Node needs to be a child of map
    public moveToPos(node: cc.Node, pos: Coordinate) {
        const tileComp = this.getTile(pos);
        if (tileComp) {
            node.setPosition(tileComp.getLandingPos());
            node.zIndex = tileComp.getLandingZIndex();
        } else {
            cc.log('unable to find tile ' + getTileKeyFromCoordinate(pos));
        }
    }

    public addToMap(node: cc.Node, pos: Coordinate) {
        this.node.addChild(node, 0);
        this.moveToPos(node, pos);
        return node;
    }

    public moveAlongPath(
        node: cc.Node,
        coors: Coordinate[],
        durationInMs: number,
        onMove?: (node: cc.Node, next: cc.Vec2) => void,
        onEnd?: () => void,
    ): Promise<void> {
        if (coors.length <= 0) {
            return Promise.resolve();
        }
        const durationPerTile = durationInMs / 1000 / coors.length;
        // assuming server doesn't send the initial tile, just the other tiles
        // on the path
        const actionSequence: cc.FiniteTimeAction[] = [];
        for (const coor of coors) {
            const tileComp = this.tileMap.get(getTileKeyFromCoordinate(coor));
            const targetPos = tileComp.getLandingPos();
            const targetZIndex = tileComp.getLandingZIndex();
            actionSequence.push(setZIndexAction(Math.max(node.zIndex, targetZIndex)));
            if (onMove) {
                actionSequence.push(callOnMoveAction(targetPos, onMove));
            }
            actionSequence.push(cc.moveTo(durationPerTile, targetPos));
            actionSequence.push(setZIndexAction(targetZIndex));
        }

        return new Promise<void>((resolve) => {
            actionSequence.push(cc.callFunc(resolve));
            const action = node.runAction(cc.sequence(actionSequence));

            setTimeout(() => {
                // the game might be in background, so update is not triggered.
                if (!action.isDone() && node.active) {
                    node.stopAction(action);
                    this.moveToPos(node, coors.slice(-1)[0]);
                    resolve();
                }
            }, durationInMs + 50);
        });
    }
    // update (dt) {}
}
