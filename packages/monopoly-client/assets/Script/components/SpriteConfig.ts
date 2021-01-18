import { assertExist } from '@prisel/client';
import SharedAssets from '../SharedAssets';
import { ComponentConfig } from './ComponentConfig';

export class SpriteConfig extends ComponentConfig {
    public spriteFrame?: cc.SpriteFrame;
    public type: cc.Sprite.Type = cc.Sprite.Type.SIMPLE;
    public blendScrBlendFactor: cc.macro.BlendFactor = cc.macro.BlendFactor.SRC_ALPHA;
    public blendDstBlendFactor: cc.macro.BlendFactor = cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA;

    protected getClass() {
        return cc.Sprite;
    }

    public static background(): SpriteConfig {
        const config = new SpriteConfig();
        config.spriteFrame = assertExist(SharedAssets.instance().uiAtlas.getSpriteFrame('shadow'));
        config.blendScrBlendFactor = cc.macro.BlendFactor.DST_COLOR;
        config.blendDstBlendFactor = cc.macro.BlendFactor.ONE_MINUS_DST_ALPHA;
        return config;
    }

    public static panel(): SpriteConfig {
        const config = new SpriteConfig();
        config.spriteFrame = assertExist(
            SharedAssets.instance().uiAtlas.getSpriteFrame('panel-round'),
        );
        config.type = cc.Sprite.Type.SLICED;

        return config;
    }

    public static coin(): SpriteConfig {
        const config = new SpriteConfig();
        config.spriteFrame = assertExist(SharedAssets.instance().uiAtlas.getSpriteFrame('coin'));
        return config;
    }

    // empty will not render anything. It is expected that later the spriteFrame
    // will be set
    public static empty(): SpriteConfig {
        const config = new SpriteConfig();
        return config;
    }

    public setType(type: cc.Sprite.Type) {
        this.type = type;
        return this;
    }

    public update(comp: cc.Sprite): void {
        comp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        if (this.spriteFrame) {
            comp.spriteFrame = this.spriteFrame;
        }
        comp.type = this.type;

        (comp as any).srcBlendFactor = this.blendScrBlendFactor;
        (comp as any).dstBlendFactor = this.blendDstBlendFactor;
    }
}
