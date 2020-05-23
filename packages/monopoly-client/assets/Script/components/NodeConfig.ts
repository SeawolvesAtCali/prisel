import { ComponentConfig } from './ComponentConfig';
import { setConfigs } from './configUtils';

export class NodeConfig {
    public componentConfigs: ComponentConfig[] = [];
    public name: string;
    public zIndex: number = 0;
    public children: NodeConfig[] = [];
    public path: string[] = [];
    public static create() {
        return new NodeConfig();
    }

    public addComponents(...comps: ComponentConfig[]) {
        this.componentConfigs = this.componentConfigs.concat(comps);
        return this;
    }

    public setName(name: string) {
        this.name = name;
        if (this.path.length > 0) {
            this.path[this.path.length - 1] = name;
        }
        return this;
    }
    public setZIndex(zIndex: number) {
        this.zIndex = zIndex;
        return this;
    }

    public getPath() {
        return this.path.join('/');
    }

    public addChild() {
        const child = NodeConfig.create();
        child.path = [...this.path, ''];
        this.children.push(child);

        return child;
    }

    public apply(node: cc.Node) {
        setConfigs(node, this.componentConfigs);
        if (this.name !== undefined) {
            node.name = this.name;
        }
        node.zIndex = this.zIndex;
        while (node.childrenCount < this.children.length) {
            node.addChild(new cc.Node());
        }
        this.children.forEach((child, index) => {
            child.apply(node.children[index]);
        });
    }

    public render() {
        const node = new cc.Node();
        this.apply(node);
        return node;
    }
}
