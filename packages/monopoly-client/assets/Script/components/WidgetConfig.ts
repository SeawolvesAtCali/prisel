import { ComponentConfig } from './ComponentConfig';

export class WidgetConfig extends ComponentConfig {
    public top: number | undefined = undefined;
    public bottom: number | undefined = undefined;
    public left: number | undefined = undefined;
    public right: number | undefined = undefined;
    public horizontalCenter: boolean = undefined;
    public veritcalCenter: boolean = undefined;

    protected getClass() {
        return cc.Widget;
    }

    public static fullSize(): WidgetConfig {
        const config = new WidgetConfig();
        config.top = 0;
        config.bottom = 0;
        config.left = 0;
        config.right = 0;
        return config;
    }

    public static centerTop(top: number): WidgetConfig {
        const config = new WidgetConfig();
        config.top = top;
        config.horizontalCenter = true;
        return config;
    }

    public static custom(top: number, right: number, bottom: number, left: number) {
        const config = new WidgetConfig();
        config.top = top;
        config.right = right;
        config.bottom = bottom;
        config.left = left;
        return config;
    }

    public update(widget: cc.Widget): void {
        widget.isAlignTop = this.top !== undefined;
        widget.isAlignBottom = this.bottom !== undefined;
        widget.isAlignLeft = this.left !== undefined;
        widget.isAlignRight = this.right !== undefined;

        if (widget.isAlignTop) {
            widget.top = this.top;
        }
        if (widget.isAlignLeft) {
            widget.left = this.left;
        }
        if (widget.isAlignRight) {
            widget.right = this.right;
        }
        if (widget.isAlignBottom) {
            widget.bottom = this.bottom;
        }
        widget.enabled = true;
    }
}
