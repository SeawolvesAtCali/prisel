const { ccclass, property } = cc._decorator;

@ccclass
export default class Pannable extends cc.Component {
    @property(cc.Integer)
    private minBottomPadding: number = 0;

    @property(cc.Integer)
    private minLeftPadding: number = 0;

    @property(cc.Integer)
    private minRightPadding: number = 0;

    @property(cc.Integer)
    private minTopPadding: number = 0;

    private startMovePosition: cc.Vec2 = null;

    public setSize(width: number, height: number) {
        this.node.setContentSize(width, height);
    }

    // return the Y value of the top edge in parent container
    public getTopY() {
        return (
            this.startMovePosition.y +
            this.node.getScale(cc.v2()).y * this.getDistanceAboveOfAnchor(this.node)
        );
    }

    public getBottomY() {
        return (
            this.startMovePosition.y -
            this.node.getScale(cc.v2()).y * this.getDistanceBelowOfAnchor(this.node)
        );
    }

    public getLeftX() {
        return (
            this.startMovePosition.x -
            this.node.getScale(cc.v2()).x * this.getDistanceLeftOfAnchor(this.node)
        );
    }

    public getRightX() {
        return (
            this.startMovePosition.x +
            this.node.getScale(cc.v2()).x * this.getDistanceRightOfAnchor(this.node)
        );
    }

    public startMove() {
        if (this.startMovePosition) {
            cc.log('cannot startMove on a already moving Pannable');
            return;
        }
        this.startMovePosition = this.node.position;
    }

    public stopMove() {
        this.startMovePosition = null;
    }

    public moveBy(vec: cc.Vec2, container: cc.Node) {
        if (!this.startMovePosition) {
            return;
        }
        const availableDistanceToMoveUp =
            this.getDistanceAboveOfAnchor(container) - this.getBottomY() - this.minBottomPadding;
        const availableDistanceToMoveDown =
            this.getDistanceBelowOfAnchor(container) + this.getTopY() - this.minTopPadding;
        const availableDistanceToMoveLeft =
            this.getDistanceLeftOfAnchor(container) + this.getRightX() - this.minRightPadding;
        const availableDistanceToMoveRight =
            this.getDistanceRightOfAnchor(container) - this.getLeftX() - this.minLeftPadding;
        const finalDelta = vec.clampf(
            cc.v2(-availableDistanceToMoveLeft, -availableDistanceToMoveDown),
            cc.v2(availableDistanceToMoveRight, availableDistanceToMoveUp),
        );

        this.node.setPosition(this.startMovePosition.add(finalDelta));
    }

    private getDistanceAboveOfAnchor(node: cc.Node) {
        return node.height * (1 - node.anchorY);
    }

    private getDistanceBelowOfAnchor(node: cc.Node) {
        return node.height * node.anchorY;
    }

    private getDistanceLeftOfAnchor(node: cc.Node) {
        return node.width * node.anchorX;
    }

    private getDistanceRightOfAnchor(node: cc.Node) {
        return node.width * (1 - node.anchorX);
    }
}
