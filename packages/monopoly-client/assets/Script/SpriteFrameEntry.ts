const { ccclass, property } = cc._decorator;

@ccclass('SpriteFrameEntry')
export class SpriteFrameEntry {
    @property(cc.String)
    public name: string = '';
    @property(cc.SpriteFrame)
    public sprite?: cc.SpriteFrame = undefined;
}
