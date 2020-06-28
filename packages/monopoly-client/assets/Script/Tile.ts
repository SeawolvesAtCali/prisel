import { Tile as TileData } from '@prisel/monopoly-common';
import { TILE_SIZE, LANDING_POS_OFFSET } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
    private tile: TileData = null;
    @property(cc.SpriteAtlas)
    private tileAtlas: cc.SpriteAtlas = null;

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
        return this.node.position.add(LANDING_POS_OFFSET);
    }

    // return the initial position of the bottom as if map's anchor is at the
    // top left corner.
    public getInitialAnchorPos() {
        return new cc.Vec2(this.tile.pos.col * TILE_SIZE, -(this.tile.pos.row + 1) * TILE_SIZE);
    }

    public getLandingZIndex() {
        return this.getZIndex() + 5;
    }

    public getZIndex() {
        return this.tile.pos.row * 10;
    }

    protected start() {
        if (this.tile.sprite) {
            this.getComponent(cc.Sprite).spriteFrame = this.tileAtlas.getSpriteFrame(
                this.tile.sprite,
            );
        }
    }
}
