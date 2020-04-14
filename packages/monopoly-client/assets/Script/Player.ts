import { PlayerInfo } from './packages/priselClient';

const { ccclass, property } = cc._decorator;
import { SpriteFrameEntry } from './SpriteFrameEntry';

@ccclass
export default class Player extends cc.Component {
    @property(cc.Label)
    private label: cc.Label = null;

    @property(SpriteFrameEntry)
    private sprites: SpriteFrameEntry[] = [];

    private character: cc.Node = null;

    private characterSprite: cc.Sprite = null;

    private characterAnim: cc.Animation = null;

    // @property
    // public text: string = 'hello';

    private playerName: string = '';
    private playerId: string = '';
    public color: string = null;
    private idleSprite: cc.SpriteFrame = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public init(playerData: PlayerInfo, color: string) {
        this.playerName = playerData.name;
        this.playerId = playerData.id;
        this.color = color;
        this.turnToLeft = this.turnToLeft.bind(this);
        this.turnToRight = this.turnToRight.bind(this);
    }

    public getId() {
        return this.playerId;
    }

    public start() {
        this.label.string = this.playerName;
        this.character = this.node.getChildByName('character');
        this.characterSprite = this.character.getComponent(cc.Sprite);
        this.characterAnim = this.character.getComponent(cc.Animation);
        const spriteFrameEntry = this.sprites.find(
            (spriteEntry) => spriteEntry.name === this.color,
        );

        this.idleSprite = spriteFrameEntry.sprite;
        this.stale();
        this.walk = this.walk.bind(this);
        this.stop = this.stop.bind(this);
    }

    private stale() {
        this.characterSprite.spriteFrame = this.idleSprite;
    }

    public walk() {
        this.characterAnim.play(this.color);
    }

    public stop() {
        this.characterAnim.stop();
        this.stale();
    }

    public turnToLeft() {
        this.character.setScale(-1, 1);
    }

    public turnToRight() {
        this.character.setScale(1, 1);
    }

    // update (dt) {}
}
