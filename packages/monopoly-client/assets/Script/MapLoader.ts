import {
    BoardSetup,
    Coordinate,
    Mixins,
    Property2,
    PropertyClass,
    Tile2,
    TileClass,
    World,
} from '@prisel/monopoly-common';
import { createAnimationEvent } from './animations';
import { TILE_SIZE } from './consts';
import PropertyTile from './PropertyTile';
import TileWrapper from './Tile';
import {
    callOnMoveAction,
    getTileAnchorPos,
    getTileKeyFromCoordinate,
    lifecycle,
    nullCheck,
    setZIndexAction,
} from './utils';

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

    private tileMap: Map<string, TileWrapper> = new Map();
    private propertyMap: Map<string, PropertyTile> = new Map();

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

    public renderMap(world: World, boardSetup: BoardSetup) {
        if (!this.emptyTile || !this.roadTile || !this.propertyTile || !this.startTile) {
            cc.log('Tile prefabs not set');
            return;
        }
        const { height, width } = boardSetup;
        this.mapHeightInPx = height * TILE_SIZE;
        this.mapWidthInPx = width * TILE_SIZE;
        this.tilePositionOffset = cc.v2(-this.mapWidthInPx / 2, this.mapHeightInPx / 2);
        this.node.setContentSize(this.mapWidthInPx, this.mapHeightInPx);

        for (const tile of world.getAll(TileClass)) {
            if (Mixins.hasMixin(tile as any, Mixins.StartMixinConfig)) {
                this.renderTile(this.startTile, tile, world);
            } else if (Mixins.hasMixin(tile, Mixins.PathMixinConfig)) {
                this.renderTile(this.roadTile, tile, world);
            } else {
                // assume it is unspecified tile
                this.renderTile(this.emptyTile, tile, world);
            }
        }

        for (const property of world.getAll(PropertyClass)) {
            this.renderProperty(property);
        }
        createAnimationEvent('invested').sub((anim) => {
            const property = this.getPropertyTileAt(anim.args.property.pos);
            if (property) {
                property.playInvestedEffect(anim.length);
            }
        });
    }

    private renderTile(tilePrefab: cc.Prefab, tile: Tile2, world: World) {
        const tileNode = cc.instantiate(tilePrefab);
        const tileComp = tileNode.getComponent(TileWrapper);
        if (!tileComp) {
            throw new Error("current tile doesn't have Tile script attached");
        }
        tileComp.init(nullCheck(tile));
        this.node.addChild(tileNode, tileComp.getZIndex());
        tileNode.setPosition(this.tilePositionOffset.add(getTileAnchorPos(tile.position)));
        this.tileMap.set(getTileKeyFromCoordinate(tile.position), tileComp);

        return tileNode;
    }

    private renderProperty(property: Property2) {
        const propertyNode = cc.instantiate(this.propertyTile);
        const propertyComp = propertyNode.getComponent(PropertyTile);
        if (!propertyComp) {
            throw new Error("current property doesn't have PropertyTile script attached");
        }
        propertyComp.init(property.dimension.anchor);
        this.node.addChild(propertyNode, propertyComp.getZIndex());
        propertyNode.setPosition(
            this.tilePositionOffset.add(getTileAnchorPos(property.dimension.anchor)),
        );
        this.propertyMap.set(getTileKeyFromCoordinate(property.dimension.anchor), propertyComp);
    }

    public getPropertyTileAt(pos: Coordinate): PropertyTile {
        const node = this.propertyMap.get(getTileKeyFromCoordinate(pos));
        if (node) {
            return node.getComponent(PropertyTile);
        }
    }

    public getTile(pos: Coordinate): TileWrapper {
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
