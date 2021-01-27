import { assertExist } from '@prisel/client';
import { Anim, exist } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { subscribeAnimation } from './animations';
import { EVENT_BUS, FLIP_THRESHHOLD } from './consts';
import MapLoader from './MapLoader';
import { SpriteFrameEntry } from './SpriteFrameEntry';
import { lifecycle } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Label)
    private label?: cc.Label;

    @property(cc.Label)
    private statusLabel?: cc.Label;

    @property(SpriteFrameEntry)
    private sprites: SpriteFrameEntry[] = [];

    private character?: cc.Node;

    private characterSprite?: cc.Sprite;

    private characterAnim?: cc.Animation;

    private playerName: string = '';
    private gamePlayerId: string = '';
    public color?: string;
    private idleSprite?: cc.SpriteFrame;

    public pos?: monopolypb.Coordinate;

    private get eventBus() {
        return cc.find(EVENT_BUS);
    }

    public init(playerData: monopolypb.GamePlayer, color: string, pos: monopolypb.Coordinate) {
        this.playerName = playerData.boundPlayer?.name ?? 'unnamed';
        this.gamePlayerId = playerData.id;
        this.color = color;
        this.turnToLeft = this.turnToLeft.bind(this);
        this.turnToRight = this.turnToRight.bind(this);
        cc.log('setting player initial pos', pos);
        this.pos = pos;
    }

    public getId() {
        return this.gamePlayerId;
    }

    @lifecycle
    public start() {
        assertExist(this.label).string = this.playerName;
        assertExist(this.statusLabel).string = '';
        this.character = this.node.getChildByName('character');
        this.characterSprite = this.character.getComponent(cc.Sprite);
        this.characterAnim = this.character.getComponent(cc.Animation);
        const spriteFrameEntry = this.sprites.find(
            (spriteEntry) => spriteEntry.name === this.color,
        );

        this.idleSprite = spriteFrameEntry?.sprite;
        this.stale();
        this.walk = this.walk.bind(this);
        this.stop = this.stop.bind(this);

        subscribeAnimation('turn_start', (anim) => {
            const turnStartExtra = Anim.getExtra(anim, monopolypb.TurnStartExtra);
            if (this.getId() === turnStartExtra?.player?.id) {
                const animState = this.getComponent(cc.Animation).playAdditive('turn_start');
                animState.speed = (animState.duration * 1000) / anim.length;
            }
        });

        subscribeAnimation('dice_down', (anim) => {
            const diceDownExtra = Anim.getExtra(anim, monopolypb.DiceDownExtra);
            if (this.getId() === diceDownExtra?.player?.id) {
                assertExist(this.statusLabel).string = '' + diceDownExtra.steps;
                const animState = this.getComponent(cc.Animation).playAdditive('status_popup');
                animState.speed = (animState.duration * 1000) / anim.length;
            }
        });

        subscribeAnimation('move', async (anim) => {
            const moveExtra = Anim.getExtra(anim, monopolypb.MoveExtra);
            if (this.getId() === moveExtra?.player?.id) {
                this.walk();
                await assertExist(MapLoader.get()).moveAlongPath(
                    this.node,
                    moveExtra.path,
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

                const finalTile = assertExist(MapLoader.get().getTile(moveExtra.path.slice(-1)[0]));
                this.node.setPosition(finalTile.getLandingPos());
                this.node.zIndex = finalTile.getLandingZIndex();

                this.stop();
            }
        });

        subscribeAnimation('teleport_pickup', (anim) => {
            const pickupExtra = Anim.getExtra(anim, monopolypb.TeleportPickupExtra);
            if (this.getId() === pickupExtra?.player?.id) {
                console.log(this.getComponent(cc.Animation).getClips());
                const animState = this.getComponent(cc.Animation).playAdditive('teleport_pickup');
                console.log('anim state', animState);
                animState.speed = (animState.duration * 1000) / anim.length;
            }
        });

        subscribeAnimation('teleport_dropoff', (anim) => {
            const dropoffExtra = Anim.getExtra(anim, monopolypb.TeleportDropoffExtra);
            if (this.getId() === dropoffExtra?.player?.id) {
                MapLoader.get().moveToPos(this.node, assertExist(dropoffExtra.dropoffLocation));
                const animState = this.getComponent(cc.Animation).playAdditive('teleport_dropoff');
                animState.speed = (animState.duration * 1000) / anim.length;
            }
        });
    }

    private stale() {
        if (exist(this.idleSprite)) {
            assertExist(this.characterSprite).spriteFrame = this.idleSprite;
        }
    }

    public walk() {
        this.characterAnim?.play(this.color);
    }

    public stop() {
        this.characterAnim?.stop();
        this.stale();
    }

    public turnToLeft() {
        this.character?.setScale(-1, 1);
    }

    public turnToRight() {
        this.character?.setScale(1, 1);
    }
}
