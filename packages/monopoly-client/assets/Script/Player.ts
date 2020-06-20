import { PlayerInfo } from './packages/priselClient';

const { ccclass, property } = cc._decorator;
import { SpriteFrameEntry } from './SpriteFrameEntry';
import { EVENT_BUS, EVENT, FLIP_THRESHHOLD } from './consts';
import { Animation, AnimationName } from '@prisel/monopoly-common';
import { getGame, lifecycle, nullCheck } from './utils';
import { PlayerRollPayload } from '@prisel/monopoly-common';
import { Anim } from '@prisel/monopoly-common';
import MapLoader from './MapLoader';

@ccclass
export default class Player extends cc.Component {
    @property(cc.Label)
    private label: cc.Label = null;

    @property(SpriteFrameEntry)
    private sprites: SpriteFrameEntry[] = [];

    private character: cc.Node = null;

    private characterSprite: cc.Sprite = null;

    private characterAnim: cc.Animation = null;

    private playerName: string = '';
    private playerId: string = '';
    public color: string = null;
    private idleSprite: cc.SpriteFrame = null;
    public playerRollPayload: PlayerRollPayload = null;

    private get eventBus() {
        return cc.find(EVENT_BUS);
    }

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

    @lifecycle
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
        this.eventBus.on(EVENT.ANIMATION, async (anim: Animation) => {
            switch (anim.name as AnimationName) {
                case 'turn_start':
                    if (this.isCurrentPlayer()) {
                        const animState = this.getComponent(cc.Animation).play('turn_start');
                        animState.speed = (animState.duration * 1000) / anim.length;
                    }
                    break;
                case 'move':
                    if (this.isCurrentPlayer()) {
                        this.walk();
                        await nullCheck(MapLoader.instance).moveAlongPath(
                            this.node,
                            this.playerRollPayload.path,
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

                        const finalTile = nullCheck(
                            MapLoader.instance.getTile(this.playerRollPayload.path.slice(-1)[0]),
                        );
                        this.node.setPosition(finalTile.getLandingPos());
                        this.node.zIndex = finalTile.getLandingZIndex();

                        this.stop();
                    }
            }
        });
    }

    private isCurrentPlayer() {
        return getGame().currentGamePlayer.getId() === this.getId();
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
