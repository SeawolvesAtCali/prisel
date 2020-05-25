import { nullCheck } from './utils';
import { PERSISTENT_NODE } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SharedAssets extends cc.Component {
    @property(cc.SpriteAtlas)
    public uiAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    public tileAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    public characterAtlas: cc.SpriteAtlas = null;

    @property(cc.Font)
    public font: cc.Font = null;

    @property(cc.Prefab)
    public rankPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    public inputPrefab: cc.Prefab = null;

    protected start() {
        nullCheck(this.uiAtlas);
        nullCheck(this.tileAtlas);
        nullCheck(this.characterAtlas);
        nullCheck(this.font);
        nullCheck(this.rankPrefab);
        nullCheck(this.inputPrefab);
    }

    public static instance(): SharedAssets {
        return nullCheck(cc.find(PERSISTENT_NODE).getComponent(SharedAssets));
    }
}
