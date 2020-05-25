import { ComponentConfig } from './ComponentConfig';
import SharedAssets from '../SharedAssets';
import { nullCheck } from '../utils';

export class ButtonConfig extends ComponentConfig {
    public interactable: boolean = true;
    public normalSprite: cc.SpriteFrame;
    public pressedSprite: cc.SpriteFrame;
    public hoverSprite: cc.SpriteFrame;
    public disabledSprite: cc.SpriteFrame;
    public onTap: () => void;
    public target: cc.Node;

    protected getClass() {
        return cc.Button;
    }

    public static menuCloseButton(onTap: () => void): ButtonConfig {
        const config = new ButtonConfig();
        const assets = SharedAssets.instance();
        config.normalSprite = nullCheck(assets.uiAtlas.getSpriteFrame('cross-light'));
        config.pressedSprite = config.normalSprite;
        config.hoverSprite = config.normalSprite;
        config.onTap = onTap;
        return config;
    }

    public static dialogCloseButton(onTap: () => void): ButtonConfig {
        const config = new ButtonConfig();
        const assets = SharedAssets.instance();
        config.normalSprite = nullCheck(assets.uiAtlas.getSpriteFrame('close-button'));
        config.pressedSprite = nullCheck(assets.uiAtlas.getSpriteFrame('close-button-pressed'));
        config.hoverSprite = nullCheck(assets.uiAtlas.getSpriteFrame('close-button-hovered'));
        config.onTap = onTap;
        return config;
    }

    public static dialogActionButton(onTap?: () => void): ButtonConfig {
        const config = new ButtonConfig();
        const assets = SharedAssets.instance();
        config.normalSprite = nullCheck(assets.uiAtlas.getSpriteFrame('dialog-button'));
        config.pressedSprite = nullCheck(assets.uiAtlas.getSpriteFrame('dialog-button-pressed'));
        config.hoverSprite = nullCheck(assets.uiAtlas.getSpriteFrame('dialog-button-hovered'));
        config.disabledSprite = nullCheck(assets.uiAtlas.getSpriteFrame('dialog-button-disabled'));
        config.interactable = !!onTap;
        config.onTap = onTap;

        return config;
    }

    public static labelButton(onTap?: () => void): ButtonConfig {
        const config = new ButtonConfig();
        const assets = SharedAssets.instance();
        config.normalSprite = nullCheck(assets.uiAtlas.getSpriteFrame('shadow'));
        config.pressedSprite = config.normalSprite;
        config.hoverSprite = config.normalSprite;
        config.onTap = onTap;
        return config;
    }

    public getInitialSpriteFrame(): cc.SpriteFrame {
        if (this.interactable) {
            return this.normalSprite;
        }
        return this.disabledSprite || this.normalSprite;
    }

    public update(comp: cc.Button): void {
        comp.interactable = this.interactable;
        comp.transition = cc.Button.Transition.SPRITE;
        comp.normalSprite = this.normalSprite;
        comp.pressedSprite = this.pressedSprite;
        comp.hoverSprite = this.hoverSprite;
        comp.disabledSprite = this.disabledSprite;
        if (this.onTap) {
            comp.node.on('click', this.onTap);
        }
        comp.target = this.target;
    }
}
