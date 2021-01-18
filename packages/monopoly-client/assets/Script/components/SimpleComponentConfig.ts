import { assertExist } from '@prisel/client';
import { ComponentConfig, ComponentSubclass } from './ComponentConfig';

export class SimpleComponentConfig extends ComponentConfig {
    private componentClass?: ComponentSubclass;

    public static create(compClass: ComponentSubclass) {
        const config = new SimpleComponentConfig();
        config.componentClass = compClass;
        return config;
    }
    protected getClass(): ComponentSubclass {
        return assertExist(this.componentClass);
    }
    public update(comp: cc.Component): void {}
}
