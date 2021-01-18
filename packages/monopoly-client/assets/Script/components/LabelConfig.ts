import SharedAssets from '../SharedAssets';
import { ComponentConfig } from './ComponentConfig';
export enum LabelTheme {
    ON_LIGHT,
    ON_DARK,
}

export function themeToColor(theme: LabelTheme) {
    switch (theme) {
        case LabelTheme.ON_LIGHT:
            // purple text
            return new cc.Color().fromHEX('#846AD0');
        case LabelTheme.ON_DARK:
            return cc.Color.WHITE;
    }
}
export class LabelConfig extends ComponentConfig {
    public text: string = '';
    public horizontalAlign: cc.Label.HorizontalAlign = cc.Label.HorizontalAlign.CENTER;
    public verticalAlign: cc.Label.VerticalAlign = cc.Label.VerticalAlign.CENTER;
    public fontSize: number = 40;
    public lineHeight: number = 40;
    public font?: cc.Font;
    public overflow: cc.Label.Overflow = cc.Label.Overflow.NONE;

    protected getClass() {
        return cc.Label;
    }
    public static h1(text: string) {
        const config = new LabelConfig();
        config.text = text;
        config.fontSize = 40;
        config.lineHeight = 40;
        config.font = SharedAssets.instance().font;
        return config;
    }

    public static p(text: string) {
        const config = new LabelConfig();
        config.text = text;
        config.fontSize = 30;
        config.lineHeight = 30;
        config.font = SharedAssets.instance().font;
        return config;
    }

    public setOverflow(overflow: cc.Label.Overflow) {
        this.overflow = overflow;
        return this;
    }
    public update(comp: cc.Label): void {
        comp.overflow = this.overflow;
        comp.string = this.text;
        comp.horizontalAlign = this.horizontalAlign;
        comp.verticalAlign = this.verticalAlign;
        comp.fontSize = this.fontSize;
        comp.lineHeight = this.lineHeight;
        if (this.font) {
            comp.font = this.font;
        }
    }
}
