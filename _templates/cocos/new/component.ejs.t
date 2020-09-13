---
to: <%= h.capitalize(name) %>.ts
---
const { ccclass, property } = cc._decorator;

@ccclass
export default class <%= h.capitalize(name) %> extends cc.Component {

    protected start() {}
}
