import { assertExist } from '@prisel/client';
import { PERSISTENT_NODE } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SharedAssets extends cc.Component {
    @property(cc.SpriteAtlas)
    private _uiAtlas?: cc.SpriteAtlas;
    public get uiAtlas() {
        return assertExist(this._uiAtlas);
    }

    @property(cc.SpriteAtlas)
    private _tileAtlas?: cc.SpriteAtlas;
    public get tileAtlas() {
        return assertExist(this._tileAtlas);
    }

    @property(cc.SpriteAtlas)
    private _characterAtlas?: cc.SpriteAtlas;
    public get characterAtlas() {
        return assertExist(this._characterAtlas);
    }

    @property(cc.Font)
    private _font?: cc.Font;
    public get font() {
        return assertExist(this._font);
    }

    @property(cc.Prefab)
    private _rankPrefab?: cc.Prefab;
    public get rankPrefab() {
        return assertExist(this._rankPrefab);
    }

    @property(cc.Prefab)
    private _inputPrefab?: cc.Prefab;
    public get inputPrefab() {
        return assertExist(this._inputPrefab);
    }

    protected start() {
        assertExist(this.uiAtlas);
        assertExist(this.tileAtlas);
        assertExist(this.characterAtlas);
        assertExist(this.font);
        assertExist(this.rankPrefab);
        assertExist(this.inputPrefab);
    }

    public static instance(): SharedAssets {
        return assertExist(cc.find(PERSISTENT_NODE).getComponent(SharedAssets));
    }
}
