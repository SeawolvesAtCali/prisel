import { assertExist } from '@prisel/client';

const { ccclass, property } = cc._decorator;

const FONT_COLOR_ON_LIGHT = new cc.Color().fromHEX('#846AD0');

@ccclass
export default class Rank extends cc.Component {
    @property(cc.Label)
    private playerNameLabel?: cc.Label;

    @property(cc.Label)
    private worthLabel?: cc.Label;

    protected start() {
        assertExist(this.playerNameLabel);
        assertExist(this.worthLabel);
    }

    public init(name: string, worth: number, rank: number) {
        assertExist(this.playerNameLabel).string = name;
        assertExist(this.worthLabel).string = '' + worth;
        const firstPlace = rank === 0;
        this.getComponent(cc.Sprite).enabled = firstPlace;
        assertExist(this.playerNameLabel).node.color = firstPlace
            ? FONT_COLOR_ON_LIGHT
            : cc.Color.WHITE;
        assertExist(this.worthLabel).node.color = firstPlace ? FONT_COLOR_ON_LIGHT : cc.Color.WHITE;
    }
}
