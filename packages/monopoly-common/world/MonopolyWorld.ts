import { GamePlayer } from './GamePlayer';
import { Property } from './Property';
import { listGameObjectSerizable } from './serializeUtil';
import { Tile } from './Tile';
import { World } from './World';

export class MonopolyWorld extends World {
    @listGameObjectSerizable(Tile)
    tiles: Tile[] = [];
    @listGameObjectSerizable(Property)
    properties: Property[] = [];
    @listGameObjectSerizable(GamePlayer)
    players: GamePlayer[] = [];

    // override
    populateSerializedFields() {
        this.tiles = this.getAll(Tile);
        this.properties = this.getAll(Property);
        this.players = this.getAll(GamePlayer);
    }

    // override
    clearSerializedFields() {
        this.tiles = [];
        this.properties = [];
        this.players = [];
    }
}
