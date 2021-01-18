import { assertExist } from '@prisel/client';
import SharedAssets from '../SharedAssets';
import { ComponentConfig } from './ComponentConfig';

export class ButtonConfig extends ComponentConfig {
    public interactable: boolean = true;
    public normalSprite?: cc.SpriteFrame;
    public pressedSprite?: cc.SpriteFrame;
    public hoverSprite?: cc.SpriteFrame;
    public disabledSprite?: cc.SpriteFrame;
    public onTap?: () => void;
    public target?: cc.Node;

    protected getClass() {
        return cc.Button;
    }

    public static menuCloseButton(onTap: () => void): ButtonConfig {
        const config = new ButtonConfig();
        const assets = SharedAssets.instance();
        config.normalSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('cross-light'),
            'cross-light sprite in ButtonConfig.ts',
        );
        config.pressedSprite = config.normalSprite;
        config.hoverSprite = config.normalSprite;
        config.onTap = onTap;
        return config;
    }

    public static dialogCloseButton(onTap: () => void): ButtonConfig {
        const config = new ButtonConfig();
        const assets = SharedAssets.instance();
        config.normalSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('close-button'),
            'close-button in ButtonConfig.ts',
        );
        config.pressedSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('close-button-pressed'),
            'close-button-pressed in ButtonConfig.ts',
        );
        config.hoverSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('close-button-hovered'),
            'close-button-hovered in ButtonConfig.ts',
        );
        config.onTap = onTap;
        return config;
    }

    public static dialogActionButton(onTap?: () => void): ButtonConfig {
        const config = new ButtonConfig();
        const assets = SharedAssets.instance();
        config.normalSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('dialog-button'),
            'dialog-button in ButtonConfig.ts',
        );
        config.pressedSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('dialog-button-pressed'),
            'dialog-button-pressed in ButtonConfig.ts',
        );
        config.hoverSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('dialog-button-hovered'),
            'dialog-button-hovered in ButtonConfig.ts',
        );
        config.disabledSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('dialog-button-disabled'),
            'dialog-button-disabled in ButtonConfig.ts',
        );
        config.interactable = !!onTap;
        config.onTap = onTap;

        return config;
    }

    public static labelButton(onTap?: () => void): ButtonConfig {
        const config = new ButtonConfig();
        const assets = SharedAssets.instance();
        config.normalSprite = assertExist(
            assets.uiAtlas.getSpriteFrame('shadow'),
            'shadow in ButtonConfig.ts',
        );
        config.pressedSprite = config.normalSprite;
        config.hoverSprite = config.normalSprite;
        config.onTap = onTap;
        return config;
    }

    public getInitialSpriteFrame(): cc.SpriteFrame {
        if (this.interactable) {
            return assertExist(this.normalSprite, 'initial sprite frame for ButtonConfig.ts');
        }
        return this.disabledSprite || assertExist(this.normalSprite);
    }

    public update(comp: cc.Button): void {
        comp.interactable = this.interactable;
        comp.transition = cc.Button.Transition.SPRITE;
        if (this.normalSprite) {
            comp.normalSprite = this.normalSprite;
        }
        if (this.pressedSprite) {
            comp.pressedSprite = this.pressedSprite;
        }
        if (this.hoverSprite) {
            comp.hoverSprite = this.hoverSprite;
        }
        if (this.disabledSprite) {
            comp.disabledSprite = this.disabledSprite;
        }
        if (this.onTap) {
            comp.node.on('click', this.onTap);
        }
        if (this.target) {
            comp.target = this.target;
        }
    }
}
