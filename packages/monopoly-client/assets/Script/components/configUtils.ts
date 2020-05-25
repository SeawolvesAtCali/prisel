import { ComponentConfig } from './ComponentConfig';

export function setConfigs(node: cc.Node, configs: ComponentConfig[]) {
    configs.forEach((config) => {
        config.init(node);
    });
}
