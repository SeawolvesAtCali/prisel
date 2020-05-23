import { ComponentConfig } from './ComponentConfig';

export class LayoutConfig extends ComponentConfig {
    public type: cc.Layout.Type = cc.Layout.Type.NONE;
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

    public static verticalContainer(spacing: number = 0, top: number = 0, bottom: number = 0) {
        const config = new LayoutConfig();
        config.type = cc.Layout.Type.VERTICAL;
        config.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        config.paddingTop = top;
        config.paddingBottom = bottom;
        config.spacingY = spacing;
        return config;
    }

    public update(comp: cc.Layout): void {
        comp.type = this.type;
        comp.resizeMode = this.resizeMode;
        comp.paddingLeft = this.paddingLeft;
        comp.paddingTop = this.paddingTop;
        comp.paddingRight = this.paddingRight;
        comp.paddingBottom = this.paddingBottom;
        comp.resizeMode = this.resizeMode;
        switch (comp.type) {
            case cc.Layout.Type.HORIZONTAL:
                comp.horizontalDirection = this.horizontalDirection;
                comp.spacingX = this.spacingX;
                break;
            case cc.Layout.Type.VERTICAL:
                comp.verticalDirection = this.verticalDirection;
                comp.spacingY = this.spacingY;
                break;
        }
    }
}
