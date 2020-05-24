import { NodeConfig } from './NodeConfig';
import { SpriteConfig } from './SpriteConfig';
import { WidgetConfig } from './WidgetConfig';

export function createDropShadow() {
    return NodeConfig.create('background').addComponents(
        SpriteConfig.background(),
        WidgetConfig.fullSize(),
    );
}
