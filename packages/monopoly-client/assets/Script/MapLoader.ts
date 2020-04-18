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
import { getTileKey, getTileKeyFromCoordinate, setZIndexAction, callOnMoveAction } from './utils';
import { MOVING_DURATION_PER_TILE, SELECTOR_ZINDEX, TILE_SIZE } from './consts';
import PropertyTile from './PropertyTile';
import Player from './Player';
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

    @property(cc.Node)
    private propertySelector: cc.Node = null;

    private startTiles: StartTile[] = null;

    private tileMap: Map<string, TileComponent> = null;

    public selectedPropertyTile: cc.Node = null;

    public mapHeightInPx = 0;
    public mapWidthInPx = 0;

    // LIFE-CYCLE CALLBACKS:

    public renderMap(boardSetup: BoardSetup) {
        if (!this.emptyTile || !this.roadTile || !this.propertyTile || !this.startTile) {
            cc.log('Tile prefabs not set');
            return;
        }
        const { tiles, height, width, roadPropertyMapping } = boardSetup;
        this.mapHeightInPx = height * TILE_SIZE;
        this.mapWidthInPx = width * TILE_SIZE;

        this.startTiles = [];
        this.tileMap = new Map();
        const onSelect = (node: cc.Node) => {
            this.selectedPropertyTile = node;
            this.moveToPos(this.propertySelector, node.getComponent(TileComponent).getTile().pos);
            this.propertySelector.active = true;
            this.propertySelector.zIndex = SELECTOR_ZINDEX;
            this.propertySelector
                .getChildByName('selector head')
                .getComponent(cc.Animation)
                .play();
            this.propertySelector
                .getChildByName('selector shadow')
                .getComponent(cc.Animation)
                .play();
        };

        for (const tile of tiles) {
            if (isRoadTile(tile)) {
                this.renderTile(this.roadTile, tile);
            } else if (isStartTile(tile)) {
                this.startTiles.push(tile);
                this.renderTile(this.startTile, tile);
            } else if (isPropertyTile(tile)) {
                const propertyTile = this.renderTile(this.propertyTile, tile);
                propertyTile.getComponent(PropertyTile).onSelect = onSelect;
            } else {
                // assume it is unspecified tile
                this.renderTile(this.emptyTile, tile);
            }
        }
    }

    private renderTile(tilePrefab: cc.Prefab, tile: Tile) {
        const tileNode = cc.instantiate(tilePrefab);
        const tileComp = tileNode.getComponent(TileComponent);
        if (!tileComp) {
            throw new Error("current tile doesn't have Tile script attached");
        }
        tileComp.init(tile);
        this.node.addChild(tileNode, tileComp.getZIndex());
        tileNode.setPosition(tileComp.getAnchorPos());
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

    // position node at the tile. Node needs to be a child of map
    public moveToPos(node: cc.Node, pos: Coordinate) {
        const tileComp = this.tileMap.get(getTileKeyFromCoordinate(pos));
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
        onMove?: (node: cc.Node, next: cc.Vec2) => void,
        callback?: (node: cc.Node) => void,
    ) {
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
            actionSequence.push(cc.moveTo(MOVING_DURATION_PER_TILE, targetPos));
            actionSequence.push(setZIndexAction(targetZIndex));
        }

        if (callback) {
            actionSequence.push(cc.callFunc(callback));
        }

        node.runAction(cc.sequence(actionSequence));
    }
    // update (dt) {}
}
