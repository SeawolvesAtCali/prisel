import { assertExist } from '@prisel/client';
import { monopolypb } from '@prisel/protos';
import { EVENT, EVENT_BUS, getCharacterAvatarSpriteName } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyPlayerStatHud extends cc.Component {
    @property(cc.SpriteAtlas)
    private avatarAtlas?: cc.SpriteAtlas;

    @property(cc.Sprite)
    private avatarSprite?: cc.Sprite;

    @property(cc.Label)
    private nameLabel?: cc.Label;

    @property(cc.Label)
    private moneyLabel?: cc.Label;

    private eventBus?: cc.Node;

    protected start() {
        this.eventBus = assertExist(cc.find(EVENT_BUS));
        this.eventBus.on(EVENT.UPDATE_MY_GAME_PLAYER_INFO, this.updateHud, this);
        this.eventBus.on(EVENT.UPDATE_MY_MONEY, this.updateMoneyHud, this);
    }

    private updateHud(gamePlayer: monopolypb.GamePlayer) {
        if (this.avatarSprite && this.avatarAtlas) {
            this.avatarSprite.spriteFrame = this.avatarAtlas.getSpriteFrame(
                getCharacterAvatarSpriteName(gamePlayer.character),
            );
        }
        if (this.nameLabel) {
            this.nameLabel.string = gamePlayer.boundPlayer?.name || 'unnamed';
        }
        this.updateMoneyHud(gamePlayer.money);
    }

    private updateMoneyHud(money: number) {
        if (this.moneyLabel) {
            this.moneyLabel.string = `${money}`;
        }
    }
}
