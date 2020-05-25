import { NodeConfig } from './components/NodeConfig';
import { createDialog } from './components/Dialog';
import { WidgetConfig } from './components/WidgetConfig';
import { SpriteConfig } from './components/SpriteConfig';
import { createButton } from './components/Button';
import { ButtonConfig } from './components/ButtonConfig';
import { LayoutConfig } from './components/LayoutConfig';
import { LabelConfig } from './components/LabelConfig';
import { SimpleComponentConfig } from './components/SimpleComponentConfig';
import BlockEvent from './BlockEvent';
import { createDropShadow } from './components/DropShadow';
import { EVENT_BUS, EVENT } from './consts';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameScreenMenu extends cc.Component {
    protected start() {
        this.node.on('click', this.createMenu, this);
    }

    private createMenu() {
        // hide the hamburger button
        this.node.active = false;
        const dialogNode = new cc.Node();
        cc.find('Canvas').addChild(dialogNode);

        const root = createDropShadow();
        // menu button
        root.addAllChildren(
            createButton({
                name: 'close menu button',
                size: new cc.Size(30, 30),
                button: ButtonConfig.menuCloseButton(() => {
                    this.node.active = true;
                    dialogNode.removeFromParent();
                }),
                widget: WidgetConfig.custom(20, 20),
            }),
        );

        const menuContent = root
            .addChild('menu content')
            .addComponents(LayoutConfig.verticalContainer(20), WidgetConfig.verticalCenter(20, 20));

        menuContent.addAllChildren(
            createButton({
                name: 'leave button',
                text: LabelConfig.h1('leave room'),
                size: new cc.Size(0, 50),
                button: ButtonConfig.labelButton(() => {
                    cc.find(EVENT_BUS).emit(EVENT.LEAVE_ROOM);
                    cc.log('leave');
                }),
                widget: WidgetConfig.horizontalContraint(0, 0),
            }),
        );

        root.apply(dialogNode);
    }
}
