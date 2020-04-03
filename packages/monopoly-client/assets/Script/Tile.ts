import { Tile as TileData } from './packages/monopolyCommon';
import { TILE_SIZE } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
    private tile: TileData = null;

    public init(tile: TileData) {
        this.tile = tile;
    }

    public getTile(): TileData {
        return this.tile;
    }

    public isTile(tile: TileData): boolean {
        if (!tile || !tile.pos) {
            return false;
        }
        return this.tile.pos.row === tile.pos.row && this.tile.pos.col === tile.pos.col;
    }

    public getLandingPos() {
        return new cc.Vec2(
            this.tile.pos.col * TILE_SIZE + TILE_SIZE / 2,
            -this.tile.pos.row * TILE_SIZE - TILE_SIZE / 2,
        );
    }

    public getAnchorPos() {
        return new cc.Vec2(this.tile.pos.col * TILE_SIZE, -this.tile.pos.row * TILE_SIZE);
    }

    public getLandingZIndex() {
        return this.getZIndex() + 5;
    }

    public getZIndex() {
        return this.tile.pos.row * 10;
    }
}
