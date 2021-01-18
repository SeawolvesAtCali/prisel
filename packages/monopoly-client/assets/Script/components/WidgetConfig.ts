import { exist } from '@prisel/monopoly-common';
import { ComponentConfig } from './ComponentConfig';

export class WidgetConfig extends ComponentConfig {
    public top?: number;
    public bottom?: number;
    public left?: number;
    public right?: number;
    public horizontalCenter?: boolean;
    public veritcalCenter?: boolean;

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

    public static horizontalCenter(top?: number, bottom?: number): WidgetConfig {
        return this.custom(top, undefined, bottom, undefined, true);
    }

    public static verticalCenter(left?: number, right?: number): WidgetConfig {
        return this.custom(undefined, right, undefined, left, false, true);
    }

    public static horizontalContraint(left?: number, right?: number): WidgetConfig {
        return this.custom(undefined, right, undefined, left);
    }

    public static center(): WidgetConfig {
        return this.custom(undefined, undefined, undefined, undefined, true, true);
    }

    public static custom(
        top?: number,
        right?: number,
        bottom?: number,
        left?: number,
        horizontalCenter?: boolean,
        veritcalCenter?: boolean,
    ) {
        const config = new WidgetConfig();
        if (horizontalCenter) {
            config.horizontalCenter = true;
        } else {
            config.right = right;
            config.left = left;
        }
        if (veritcalCenter) {
            config.veritcalCenter = true;
        } else {
            config.top = top;
            config.bottom = bottom;
        }

        return config;
    }

    public update(widget: cc.Widget): void {
        widget.isAlignTop = this.top !== undefined;
        widget.isAlignBottom = this.bottom !== undefined;
        widget.isAlignLeft = this.left !== undefined;
        widget.isAlignRight = this.right !== undefined;

        if (widget.isAlignTop && exist(this.top)) {
            widget.top = this.top;
        }
        if (widget.isAlignLeft && exist(this.left)) {
            widget.left = this.left;
        }
        if (widget.isAlignRight && exist(this.right)) {
            widget.right = this.right;
        }
        if (widget.isAlignBottom && exist(this.bottom)) {
            widget.bottom = this.bottom;
        }

        if (exist(this.horizontalCenter)) {
            widget.isAlignHorizontalCenter = this.horizontalCenter;
        }
        if (exist(this.veritcalCenter)) {
            widget.isAlignVerticalCenter = this.veritcalCenter;
        }

        // Default align mode is ON_WINDOW_RESIZE. This doesn't respond to
        // contentSize change due to setContentSize or new items added to Layout
        // CONTAINER
        // Setting alignMode to ALWAYS to enable widget alignment when size change
        widget.alignMode = cc.Widget.AlignMode.ALWAYS;
    }
}
