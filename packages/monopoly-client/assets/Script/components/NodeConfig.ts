import { ComponentConfig } from './ComponentConfig';
import { setConfigs } from './configUtils';
import { LabelConfig } from './LabelConfig';
import { LayoutConfig } from './LayoutConfig';
import { WidgetConfig } from './WidgetConfig';

export interface NodeConfigExport {
    [childName: string]: string;
}

/**
 * A configuration for a node. NodeConfig records the properties used to render
 * a node. In CocosCreator, an UI element is made up of a tree of Nodes and
 * Components on each Node. `componentConfigs` records the Components to be
 * added to the current node, and `children` records the children nodes to be
 * added as child of current node.
 */
export class NodeConfig<Export extends NodeConfigExport = {}> {
    public componentConfigs: ComponentConfig[] = [];
    public name: string = '';
    public zIndex: number = 0;
    public children: NodeConfig[] = [];
    public parent?: NodeConfig;
    public size: cc.Size = cc.Size.ZERO;
    public color: cc.Color = cc.Color.WHITE;
    public anchor: cc.Vec2 = cc.v2(0.5, 0.5);
    public prefab?: cc.Prefab;
    private onApply?: (node: cc.Node) => void;
    /**
     * exports are a map of string string pair where key is a canonical name of
     * child and value is the actual node path from the root. For example, in a
     * NodeConfig for dialog, there might be an export of "closeButton" and the
     * value might be "panel/panel/button 1".
     */
    public exports?: Export;

    private zeroAreaWarningSuppressed = false;

    public static create<T extends NodeConfigExport = {}>(name: string) {
        const rootNode = new NodeConfig<T>();
        rootNode.name = name;
        return rootNode;
    }

    public static fromPrefab<T extends NodeConfigExport = {}>(name: string, prefab: cc.Prefab) {
        const rootNode = new NodeConfig<T>();
        rootNode.name = name;
        rootNode.prefab = prefab;
        return rootNode;
    }

    public setExports(exports: Export) {
        this.exports = exports;
        return this;
    }

    public addComponents(...comps: ComponentConfig[]) {
        this.componentConfigs = this.componentConfigs.concat(comps);
        return this;
    }

    public getComponent<T extends ComponentConfig>(type: new () => T): T {
        return this.componentConfigs.find((config) => config instanceof type) as T;
    }

    public suppressZeroAreaWarning() {
        this.zeroAreaWarningSuppressed = true;
        return this;
    }

    public setColor(color: cc.Color) {
        this.color = color;
        return this;
    }
    public setName(name: string) {
        this.name = name;
        return this;
    }

    public setZIndex(zIndex: number) {
        this.zIndex = zIndex;
        return this;
    }

    public setHeight(height: number) {
        this.size = new cc.Size(this.size.width, height);
        return this;
    }

    public setWidth(width: number) {
        this.size = new cc.Size(width, this.size.height);
        return this;
    }

    public setSize(size: cc.Size) {
        this.size = size;
        return this;
    }

    public setAnchor(anchor: cc.Vec2) {
        this.anchor = anchor;
        return this;
    }

    public getPath(start?: NodeConfig) {
        const path = this.getPathInternal(start);
        if (!path) {
            return '';
        }
        return path;
    }

    private getPathInternal(start?: NodeConfig): string | undefined {
        // ending condition is either we reach start, or we reach root
        if (this === start) {
            return '';
        }
        if (!start && !this.parent) {
            return '';
        }
        if (start && !this.parent) {
            // we reach root, but start is not in the path.
            return undefined;
        }

        const parentPath = this.parent?.getPathInternal(start);
        if (parentPath === undefined) {
            return undefined;
        }
        if (parentPath) {
            return `${parentPath}/${this.name}`;
        }
        // parent is root, this is the first level
        return this.name;
    }

    public addChild(name: string) {
        if (this.prefab) {
            // this is a prefab config, let's not mess with the internal of
            // prefab.
            throw new Error(`cannot addChild on a prefab NodeConfig at ${this.getPath()}`);
        }
        const child = NodeConfig.create(name);
        child.parent = this;
        this.children.push(child);

        return child;
    }

    public addAllChildren(...children: NodeConfig[] | [NodeConfig[]]) {
        if (this.prefab) {
            // this is a prefab config, let's not mess with the internal of
            // prefab.
            throw new Error(`cannot addAllChildren on a prefab NodeConfig at ${this.getPath()}`);
        }
        if (children.length === 0) {
            return this;
        }
        const childrenList = Array.isArray(children[0])
            ? (children[0] as NodeConfig[])
            : (children as NodeConfig[]);

        for (const child of childrenList) {
            child.parent = this;
        }
        this.children = this.children.concat(childrenList);
        return this;
    }

    public postApply(callback: (node: cc.Node) => void) {
        this.onApply = callback;
        return this;
    }

    /**
     * Apply sets the `ComponentConfig`s and add childrens on the given node and
     * children recursively.
     * @param node the root node to apply the configs on
     */
    public apply(node: cc.Node) {
        if (this.prefab) {
            throw new Error(
                `NodeConfig at '${this.getPath()}' is a prefab NodeConfig. It cannot be used with 'apply'.`,
            );
        }
        return this.internalApply(node);
    }

    private internalApply(node: cc.Node) {
        node.setContentSize(this.size);
        node.setAnchorPoint(this.anchor);
        node.color = this.color;
        if (this.name !== undefined) {
            node.name = this.name;
        }
        node.zIndex = this.zIndex;

        this.children.forEach((child, index) => {
            if (node.childrenCount <= index) {
                node.addChild(child.render());
            } else {
                child.apply(node.children[index]);
            }
        });
        setConfigs(node, this.componentConfigs);

        if (this.onApply) {
            this.onApply(node);
        }
        if (
            !(this.hasNonZeroHeight() && this.hasNonZeroWidth()) &&
            !this.zeroAreaWarningSuppressed
        ) {
            cc.log(
                `${this.getPath()} has zero size! If this is intentional, set suppressZeroAreaWarning`,
            );
        }
        return node;
    }

    // width is non-zero or
    // has constraint such as WidgetConfig or LayoutConfig so that a 0 width
    // will be updated to non-0 in runtime
    private hasNonZeroWidth() {
        if (this.size.width > 0) {
            return true;
        }
        const widgetConfig = this.getComponent(WidgetConfig);
        if (widgetConfig && widgetConfig.left !== undefined && widgetConfig.right !== undefined) {
            return true;
        }
        const layoutConfig = this.getComponent(LayoutConfig);
        if (
            layoutConfig &&
            layoutConfig.type === cc.Layout.Type.HORIZONTAL &&
            layoutConfig.resizeMode === cc.Layout.ResizeMode.CONTAINER
        ) {
            return true;
        }
        const labelConfig = this.getComponent(LabelConfig);
        if (labelConfig && labelConfig.text && labelConfig.overflow === cc.Label.Overflow.NONE) {
            // NONE will dynamically adjust size based on text length
            return true;
        }
        return false;
    }

    // height is none zero or
    // has constraint such as WidgetConfig or LayoutConfig so that a 0 height
    // will be updated to non-zero in runtime
    private hasNonZeroHeight() {
        if (this.size.height > 0) {
            return true;
        }
        const widgetConfig = this.getComponent(WidgetConfig);
        if (widgetConfig && widgetConfig.top !== undefined && widgetConfig.bottom !== undefined) {
            return true;
        }
        const layoutConfig = this.getComponent(LayoutConfig);
        if (
            layoutConfig &&
            layoutConfig.type === cc.Layout.Type.VERTICAL &&
            layoutConfig.resizeMode === cc.Layout.ResizeMode.CONTAINER
        ) {
            return true;
        }
        const labelConfig = this.getComponent(LabelConfig);
        if (
            labelConfig &&
            labelConfig.text &&
            (labelConfig.overflow === cc.Label.Overflow.NONE ||
                labelConfig.overflow === cc.Label.Overflow.RESIZE_HEIGHT)
        ) {
            // NONE and RESIZE_HEIGHT will dynamically adjust size based on text length
            return true;
        }
        return false;
    }

    /**
     * Render creates a new node and then call apply on this node. Return the
     * node in the end.
     */
    public render() {
        return this.internalApply(this.prefab ? cc.instantiate(this.prefab) : new cc.Node());
    }
}
