import { ComponentConfig } from './ComponentConfig';
import SharedAssets from '../SharedAssets';

export class LabelConfig extends ComponentConfig {
    public text: string = '';
    public horizontalAlign: cc.Label.HorizontalAlign = cc.Label.HorizontalAlign.CENTER;
    public verticalAlign: cc.Label.VerticalAlign = cc.Label.VerticalAlign.CENTER;
    public fontSize: number = 40;
    public lineHeight: number = 40;
    public font: cc.Font;

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
    public update(comp: cc.Label): void {
        comp.string = this.text;
        comp.horizontalAlign = this.horizontalAlign;
        comp.verticalAlign = this.verticalAlign;
        comp.fontSize = this.fontSize;
        comp.lineHeight = this.lineHeight;
        comp.font = this.font;
    }
}
