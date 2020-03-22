const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
    @property(cc.Label)
    public label: cc.Label = null;

    @property
    public text: string = 'hello';

    public start() {
        // init logic
        this.label.string = this.text;
    }
}
