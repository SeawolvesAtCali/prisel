export interface ComponentSubclass {
    prototype: cc.Component;
    new (): cc.Component;
}

export abstract class ComponentConfig {
    protected abstract getClass(): ComponentSubclass;

    public init(node: cc.Node) {
        const compClass = this.getClass();
        if (!node.getComponent(compClass)) {
            node.addComponent(compClass);
        }
        const comp = node.getComponent(compClass) || node.addComponent(compClass);
        this.update(comp);
    }

    public abstract update(comp: cc.Component): void;
}
