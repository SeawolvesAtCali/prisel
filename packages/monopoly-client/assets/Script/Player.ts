import { PlayerInfo } from './packages/priselClient';

const { ccclass, property } = cc._decorator;
import { SpriteFrameEntry } from './SpriteFrameEntry';
import { EVENT_BUS, FLIP_THRESHHOLD } from './consts';
import { Coordinate } from './packages/monopolyCommon';
import { lifecycle, nullCheck } from './utils';
import MapLoader from './MapLoader';
import { createAnimationEvent, animEmitter } from './animations';

@ccclass
export default class Player extends cc.Component {
    @property(cc.Label)
    private label: cc.Label = null;

    @property(cc.Label)
    private statusLabel: cc.Label = null;

    @property(SpriteFrameEntry)
    private sprites: SpriteFrameEntry[] = [];

    private character: cc.Node = null;

    private characterSprite: cc.Sprite = null;

    private characterAnim: cc.Animation = null;

    private playerName: string = '';
    private playerId: string = '';
    public color: string = null;
    private idleSprite: cc.SpriteFrame = null;

    public pos: Coordinate = null;

    private get eventBus() {
        return cc.find(EVENT_BUS);
    }

    public init(playerData: PlayerInfo, color: string, pos: Coordinate) {
        this.playerName = playerData.name;
        this.playerId = playerData.id;
        this.color = color;
        this.turnToLeft = this.turnToLeft.bind(this);
        this.turnToRight = this.turnToRight.bind(this);
        cc.log('setting player initial pos', pos);
        this.pos = pos;
    }

    public getId() {
        return this.playerId;
    }

    @lifecycle
    public start() {
        this.label.string = this.playerName;
        nullCheck(this.statusLabel).string = '';
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

        createAnimationEvent('turn_start').sub(animEmitter, (anim) => {
            if (this.getId() === anim.args.player.player.id) {
                const animState = this.getComponent(cc.Animation).playAdditive('turn_start');
                animState.speed = (animState.duration * 1000) / anim.length;
            }
        });

        createAnimationEvent('dice_down').sub(animEmitter, (anim) => {
            if (this.getId() === anim.args.player.player.id) {
                this.statusLabel.string = '' + anim.args.steps;
                const animState = this.getComponent(cc.Animation).playAdditive('status_popup');
                animState.speed = (animState.duration * 1000) / anim.length;
            }
        });

        createAnimationEvent('move').sub(animEmitter, async (anim) => {
            if (this.getId() === anim.args.player.player.id) {
                this.walk();
                await nullCheck(MapLoader.get()).moveAlongPath(
                    this.node,
                    anim.args.path,
                    anim.length,
                    (node, targetPos: cc.Vec2) => {
                        if (targetPos.x - node.position.x > FLIP_THRESHHOLD) {
                            this.turnToRight();
                        }
                        if (node.position.x - targetPos.x > FLIP_THRESHHOLD) {
                            this.turnToLeft();
                        }
                    },
                );

                const finalTile = nullCheck(MapLoader.get().getTile(anim.args.path.slice(-1)[0]));
                this.node.setPosition(finalTile.getLandingPos());
                this.node.zIndex = finalTile.getLandingZIndex();

                this.stop();
            }
        });
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
}
