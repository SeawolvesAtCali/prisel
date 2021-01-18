import { assertExist } from '@prisel/client';
import { PERSISTENT_NODE } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SharedAssets extends cc.Component {
    // properties starting with _ will not show up in cocos editor. So use
    // ending _ to denote internal variable.
    @property(cc.SpriteAtlas)
    private uiAtlas_?: cc.SpriteAtlas;
    public get uiAtlas() {
        return assertExist(this.uiAtlas_);
    }

    @property(cc.SpriteAtlas)
    private tileAtlas_?: cc.SpriteAtlas;
    public get tileAtlas() {
        return assertExist(this.tileAtlas_);
    }

    @property(cc.SpriteAtlas)
    private characterAtlas_?: cc.SpriteAtlas;
    public get characterAtlas() {
        return assertExist(this.characterAtlas_);
    }

    @property(cc.Font)
    private font_?: cc.Font;
    public get font() {
        return assertExist(this.font_);
    }

    @property(cc.Prefab)
    private rankPrefab_?: cc.Prefab;
    public get rankPrefab() {
        return assertExist(this.rankPrefab_);
    }

    @property(cc.Prefab)
    private inputPrefab_?: cc.Prefab;
    public get inputPrefab() {
        return assertExist(this.inputPrefab_);
    }

    public static instance(): SharedAssets {
        return assertExist(cc.find(PERSISTENT_NODE).getComponent(SharedAssets));
    }
}
