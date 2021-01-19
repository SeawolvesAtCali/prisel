import { ComponentConfig } from './ComponentConfig';

export class LayoutConfig extends ComponentConfig {
    public type: cc.Layout.Type = cc.Layout.Type.NONE;
    // For container, most likely we want to use ResizeMode.CONTAINER and ResizeMode.NONE.
    // ResizeMode.CHILDREN will force children size.
    public resizeMode: cc.Layout.ResizeMode = cc.Layout.ResizeMode.NONE;
    public paddingTop: number = 0;
    public paddingBottom: number = 0;
    public paddingLeft: number = 0;
    public paddingRight: number = 0;
    public spacingX: number = 0;
    public spacingY: number = 0;
    public verticalDirection: cc.Layout.VerticalDirection =
        cc.Layout.VerticalDirection.TOP_TO_BOTTOM;
    public horizontalDirection: cc.Layout.HorizontalDirection =
        cc.Layout.HorizontalDirection.LEFT_TO_RIGHT;

    protected getClass() {
        return cc.Layout;
    }

    /**
     * Create container with fixed width(specified by size or Widget) and
     * flexible height. Height is determined by sum of children heights.
     * Children are stacked vertically.
     * @param spacing vertical spacing between childrens
     * @param top top padding
     * @param bottom bottom padding
     */
    public static verticalWrapChildren(spacing: number = 0, top: number = 0, bottom: number = 0) {
        const config = new LayoutConfig();
        config.type = cc.Layout.Type.VERTICAL;
        config.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        config.paddingTop = top;
        config.paddingBottom = bottom;
        config.spacingY = spacing;
        return config;
    }

    /**
     * Create container with fixed width and fixed height (determined by size or
     * Widget). Children are layouted horizontally
     * @param spacing horizontal spacing between children
     * @param left left padding
     * @param right right padding
     */
    public static horizontal(spacing: number = 0, left: number = 0, right: number = 0) {
        const config = new LayoutConfig();
        config.type = cc.Layout.Type.HORIZONTAL;
        config.resizeMode = cc.Layout.ResizeMode.NONE;
        config.paddingLeft = left;
        config.paddingRight = right;
        config.spacingX = spacing;
        return config;
    }

    /**
     * Create container with fixed width and fixed height (determined by size or
     * Widget). Children are layouted vertically
     * @param spacing vertical spacing between children
     * @param top top padding
     * @param bottom bottom padding
     */
    public static vertical(spacing: number = 0, top: number = 0, bottom: number = 0) {
        const config = new LayoutConfig();
        config.type = cc.Layout.Type.VERTICAL;
        config.resizeMode = cc.Layout.ResizeMode.NONE;
        config.paddingTop = top;
        config.paddingBottom = bottom;
        config.spacingY = spacing;
        return config;
    }

    public update(comp: cc.Layout): void {
        comp.type = this.type;
        comp.resizeMode = this.resizeMode;
        comp.resizeMode = this.resizeMode;
        switch (this.type) {
            case cc.Layout.Type.HORIZONTAL:
                comp.paddingLeft = this.paddingLeft;
                comp.paddingRight = this.paddingRight;
                comp.horizontalDirection = this.horizontalDirection;
                comp.spacingX = this.spacingX;
                break;
            case cc.Layout.Type.VERTICAL:
                comp.paddingTop = this.paddingTop;
                comp.paddingBottom = this.paddingBottom;
                comp.verticalDirection = this.verticalDirection;
                comp.spacingY = this.spacingY;
                break;
        }
    }
}
