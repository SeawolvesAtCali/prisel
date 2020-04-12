import { PlayerInfo } from './packages/priselClient';

const { ccclass, property } = cc._decorator;
import { SpriteFrameEntry } from './SpriteFrameEntry';

@ccclass
export default class Player extends cc.Component {
    @property(cc.Label)
    private label: cc.Label = null;

    @property(SpriteFrameEntry)
    private sprites: SpriteFrameEntry[] = [];

    // @property
    // public text: string = 'hello';

    private playerName: string = '';
    private playerId: string = '';
    public color: string = null;
    private anim: cc.Animation = null;
    private staleSprite: cc.SpriteFrame = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public init(playerData: PlayerInfo, color: string) {
        this.playerName = playerData.name;
        this.playerId = playerData.id;
        this.color = color;
    }

    public getId() {
        return this.playerId;
    }

    public start() {
        this.label.string = this.playerName;
        this.anim = this.getComponent(cc.Animation);
        const spriteFrameEntry = this.sprites.find(
            (spriteEntry) => spriteEntry.name === this.color,
        );

        this.staleSprite = spriteFrameEntry.sprite;
        this.stale();
        this.walk = this.walk.bind(this);
        this.stop = this.stop.bind(this);
    }

    private stale() {
        this.getComponent(cc.Sprite).spriteFrame = this.staleSprite;
    }

    public walk() {
        this.anim.play(this.color);
    }

    public stop() {
        this.anim.stop();
        this.stale();
    }

    // update (dt) {}
}
