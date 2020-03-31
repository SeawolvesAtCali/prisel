import { isRoadTile, isStartTile, isPropertyTile, BoardSetup } from './packages/monopolyCommon';
const { ccclass, property } = cc._decorator;
const TILE_SIZE = 50;

@ccclass
export default class MapLoader extends cc.Component {
    @property
    public mapJsonPath = '';

    @property(cc.Prefab)
    public emptyTile = null;

    @property(cc.Prefab)
    public roadTile = null;

    @property(cc.Prefab)
    public propertyTile = null;

    @property(cc.Prefab)
    public startTile = null;

    // LIFE-CYCLE CALLBACKS:

    public onLoad() {
        // load map data
        if (this.mapJsonPath) {
            cc.loader.loadRes(this.mapJsonPath, cc.JsonAsset, (err, json) => {
                if (err) {
                    cc.log('err loading map' + err);
                    return;
                }
                this.renderMap(json.json as BoardSetup);
            });
            return;
        }
        cc.log('mapJsonPath is empty ' + this.mapJsonPath);
    }

    private renderMap(boardSetup: BoardSetup) {
        if (!this.emptyTile || !this.roadTile || !this.propertyTile || !this.startTile) {
            cc.log('Tile prefabs not set');
            return;
        }
        const { tiles, height, width, roadPropertyMapping } = boardSetup;
        let row = 0;
        let col = 0;
        for (const tile of tiles) {
            if (isRoadTile(tile)) {
                this.renderTile(this.roadTile, row, col);
            } else if (isStartTile(tile)) {
                this.renderTile(this.startTile, row, col);
            } else if (isPropertyTile(tile)) {
                this.renderTile(this.propertyTile, row, col);
            } else {
                // assume it is unspecified tile
                this.renderTile(this.emptyTile, row, col);
            }
            col = col + 1;
            if (col === width) {
                col = 0;
                row = row + 1;
            }
        }
    }

    private renderTile(tile: cc.Prefab, row: number, col: number) {
        const tileNode = cc.instantiate(tile);
        this.node.addChild(tileNode, row);
        tileNode.setPosition(col * TILE_SIZE, -row * TILE_SIZE);
        return tileNode;
    }

    public start() {}

    // update (dt) {}
}
