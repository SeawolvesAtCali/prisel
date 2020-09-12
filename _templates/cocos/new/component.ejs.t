---
to: <%= capitalize(name) %>.ts
---
import MapLoader from './MapLoader';

const { ccclass, property } = cc._decorator;

@ccclass
export default <%= capitalize(name) %> extends cc.Component {

    protected start() {}
}
