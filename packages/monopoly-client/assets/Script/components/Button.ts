import { assertExist } from '@prisel/client';
import { ButtonConfig } from './ButtonConfig';
import { LabelConfig, LabelTheme, themeToColor } from './LabelConfig';
import { NodeConfig } from './NodeConfig';
import { SpriteConfig } from './SpriteConfig';
import { WidgetConfig } from './WidgetConfig';

interface ButtonProps {
    name?: string;
    text?: LabelConfig;
    // size of the button, which might be overwritten by widget
    size?: cc.Size;
    button: ButtonConfig;
    widget?: WidgetConfig;
    textTheme?: LabelTheme;
}

/**
 * Utility function that creates a button cc.Node (including the target area,
 * text, etc) using the given ButtonConfig.
 * @param props
 */
export function createButton(props: ButtonProps) {
    const {
        name = 'button',
        text,
        size = new cc.Size(100, 100),
        button,
        widget,
        textTheme = LabelTheme.ON_DARK,
    } = props;
    const root = NodeConfig.create(name).setSize(size);
    root.addComponents(button);
    if (widget) {
        root.addComponents(widget);
    }
    const background = root
        .addChild('background')
        .setAnchor(cc.v2(0.5, 1))
        .addComponents(
            SpriteConfig.empty().setType(cc.Sprite.Type.SLICED),
            WidgetConfig.fullSize(),
        );
    root.postApply((rootNode) => {
        const target = assertExist(cc.find(background.getPath(root), rootNode));
        rootNode.getComponent(cc.Button).target = target;
        assertExist(target.getComponent(cc.Sprite)).spriteFrame = button.getInitialSpriteFrame();
    });

    if (text) {
        background
            .addChild('label')
            .setAnchor(cc.v2(0.5, 1))
            .setColor(themeToColor(textTheme))
            .addComponents(text.setOverflow(cc.Label.Overflow.CLAMP), WidgetConfig.fullSize());
    }
    return root;
}
