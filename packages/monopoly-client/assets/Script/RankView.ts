import { nullCheck } from './utils';

const { ccclass, property } = cc._decorator;

const FONT_COLOR_ON_LIGHT = new cc.Color().fromHEX('#846AD0');

@ccclass
export default class Rank extends cc.Component {
    @property(cc.Label)
    private playerNameLabel: cc.Label = null;

    @property(cc.Label)
    private worthLabel: cc.Label = null;

    protected start() {
        nullCheck(this.playerNameLabel);
        nullCheck(this.worthLabel);
    }

    public init(name: string, worth: number, rank: number) {
        this.playerNameLabel.string = name;
        this.worthLabel.string = '' + worth;
        const firstPlace = rank === 0;
        this.getComponent(cc.Sprite).enabled = firstPlace;
        this.playerNameLabel.node.color = firstPlace ? FONT_COLOR_ON_LIGHT : cc.Color.WHITE;
        this.worthLabel.node.color = firstPlace ? FONT_COLOR_ON_LIGHT : cc.Color.WHITE;
    }
}
