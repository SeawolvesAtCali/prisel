import BlockEvent from '../BlockEvent';
import { NodeConfig } from './NodeConfig';
import { SimpleComponentConfig } from './SimpleComponentConfig';
import { SpriteConfig } from './SpriteConfig';
import { WidgetConfig } from './WidgetConfig';

export function createDropShadow() {
    return NodeConfig.create('drop shadow').addComponents(
        SimpleComponentConfig.create(BlockEvent),
        SpriteConfig.background(),
        WidgetConfig.fullSize(),
    );
}
