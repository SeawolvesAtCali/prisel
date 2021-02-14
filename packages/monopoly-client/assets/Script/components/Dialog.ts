import { createButton } from './Button';
import { ButtonConfig } from './ButtonConfig';
import { createDropShadow } from './DropShadow';
import { LabelConfig, LabelTheme, themeToColor } from './LabelConfig';
import { LayoutConfig } from './LayoutConfig';
import { NodeConfig, NodeConfigExport } from './NodeConfig';
import { SpriteConfig } from './SpriteConfig';
import { WidgetConfig } from './WidgetConfig';

export enum DialogPosition {
    CENTER,
    BOTTOM_CENTER,
}
interface DialogProps {
    name?: string;
    title: string;
    position?: DialogPosition;
    content?: NodeConfig | NodeConfig[];
    actionText: string;
    onClose?: () => void;
    onAction?: () => void;
}

export interface DialogExport extends NodeConfigExport {
    actionButton: string;
}

function getWidgetConfigForPosition(position: DialogPosition) {
    switch (position) {
        case DialogPosition.CENTER:
            return WidgetConfig.center();
        case DialogPosition.BOTTOM_CENTER:
            return WidgetConfig.horizontalCenter(undefined, 20);
    }
}
export function createDialog(props: DialogProps): NodeConfig<DialogExport> {
    const {
        name = 'dialog',
        title,
        position = DialogPosition.CENTER,
        content,
        actionText,
        onClose,
        onAction,
    } = props;
    const root = NodeConfig.create<DialogExport>(name).addComponents(WidgetConfig.fullSize());
    const panel = root
        .addAllChildren(createDropShadow())
        .addChild('panel') // panel
        .setSize(new cc.Size(300, 0)) // height is dynamic
        .addComponents(
            SpriteConfig.panel(),
            LayoutConfig.verticalWrapChildren(10, 17.9, 0),
            getWidgetConfigForPosition(position),
        );

    const header = panel
        .addChild('header')
        .setSize(new cc.Size(0, 50)) // width set by widget
        .addComponents(WidgetConfig.custom(undefined, 0, undefined, 0));
    header
        .addChild('title label')
        .setColor(themeToColor(LabelTheme.ON_LIGHT))
        .addComponents(LabelConfig.h1(title), WidgetConfig.center());
    if (onClose) {
        header.addAllChildren(
            createButton({
                name: 'close button',
                size: new cc.Size(30, 30),
                button: ButtonConfig.dialogCloseButton(onClose),
                widget: WidgetConfig.custom(-10, 5),
            }),
        );
    }

    if (content) {
        if (Array.isArray(content)) {
            panel.addAllChildren(...content);
        } else {
            panel.addAllChildren(content);
        }
    }
    const actionButton = createButton({
        name: 'action button',
        text: LabelConfig.h1(actionText).setOverflow(cc.Label.Overflow.CLAMP),
        size: new cc.Size(0, 60), // width will be overriden by widget
        button: ButtonConfig.dialogActionButton(onAction),
        widget: WidgetConfig.custom(undefined, 0, 0, 0),
    });
    panel.addAllChildren(actionButton);
    root.setExports({ actionButton: actionButton.getPath(root) });

    return root;
}
