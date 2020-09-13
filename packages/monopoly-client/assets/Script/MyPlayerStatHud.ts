import { GamePlayerInfo } from '@prisel/monopoly-common';
import { EVENT, EVENT_BUS, getCharacterAvatarSpriteName } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.SpriteAtlas)
    private avatarAtlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    private avatarSprite: cc.Sprite = null;

    @property(cc.Label)
    private nameLabel: cc.Label = null;

    @property(cc.Label)
    private moneyLabel: cc.Label = null;

    private eventBus: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected start() {
        this.eventBus = cc.find(EVENT_BUS);
        this.eventBus.on(EVENT.UPDATE_MY_GAME_PLAYER_INFO, this.updateHud, this);
        this.eventBus.on(EVENT.UPDATE_MY_MONEY, this.updateMoneyHud, this);
    }

    private updateHud(gamePlayer: GamePlayerInfo) {
        this.avatarSprite.spriteFrame = this.avatarAtlas.getSpriteFrame(
            getCharacterAvatarSpriteName(gamePlayer.character),
        );
        this.nameLabel.string = gamePlayer.player.name;
        this.updateMoneyHud(gamePlayer.money);
    }
    private updateMoneyHud(money: number) {
        this.moneyLabel.string = `${money}`;
    }

    // update (dt) {}
}
