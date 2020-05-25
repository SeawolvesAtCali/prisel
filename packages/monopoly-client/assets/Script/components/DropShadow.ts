import { NodeConfig } from './NodeConfig';
import { SpriteConfig } from './SpriteConfig';
import { WidgetConfig } from './WidgetConfig';
import { SimpleComponentConfig } from './SimpleComponentConfig';
import BlockEvent from '../BlockEvent';

export function createDropShadow() {
    return NodeConfig.create('drop shadow').addComponents(
        SimpleComponentConfig.create(BlockEvent),
        SpriteConfig.background(),
        WidgetConfig.fullSize(),
    );
}
