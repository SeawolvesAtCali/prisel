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
import { getTileKey, getTileKeyFromCoordinate, setZIndexAction } from './utils';
import { MOVING_DURATION_PER_TILE } from './consts';
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

    // LIFE-CYCLE CALLBACKS:

    public renderMap(boardSetup: BoardSetup) {
        if (!this.emptyTile || !this.roadTile || !this.propertyTile || !this.startTile) {
            cc.log('Tile prefabs not set');
            return;
        }
        const { tiles, height, width, roadPropertyMapping } = boardSetup;

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

    protected start() {}

    public getStartTiles(): StartTile[] {
        return this.startTiles;
    }

    // position node at the tile. Node needs to be a child of map
    public posToTile(tile: Tile, node: cc.Node) {
        const tileComp = this.tileMap.get(getTileKey(tile));
        if (tileComp) {
            node.setPosition(tileComp.getLandingPos());
            node.zIndex = tileComp.getLandingZIndex();
        } else {
            cc.log('unable to find tile ' + getTileKey(tile));
        }
    }

    public moveAlongPath(node: cc.Node, coors: Coordinate[], callback?: (node: cc.Node) => void) {
        // assuming server doesn't send the initial tile, just the other tiles
        // on the path
        const actionSequence: cc.FiniteTimeAction[] = [];
        for (const coor of coors) {
            const tileComp = this.tileMap.get(getTileKeyFromCoordinate(coor));
            actionSequence.push(setZIndexAction(tileComp.getLandingZIndex()));
            actionSequence.push(cc.moveTo(MOVING_DURATION_PER_TILE, tileComp.getLandingPos()));
        }
        if (callback) {
            actionSequence.push(cc.callFunc(callback));
        }

        node.runAction(cc.sequence(actionSequence));
    }
    // update (dt) {}
}
