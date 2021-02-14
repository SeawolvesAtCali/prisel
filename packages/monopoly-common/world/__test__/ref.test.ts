import { GameObject } from '../GameObject';
import { Ref } from '../ref2';
import { refSerializable } from '../serializeUtil';
import { World } from '../World';

class TestObject extends GameObject {
    static TYPE = 'test';
    readonly type = 'test';
    @refSerializable
    ref?: Ref<TestObject>;
}

describe('ref', () => {
    test('serialize', () => {
        const world = new World();
        world.registerObject(TestObject);
        const object1 = world.create(TestObject, 'object1');
        const object2Ref = world.createRef(TestObject, 'object2');
        object1.ref = object2Ref;
        expect(object1.serialize()).toMatchSnapshot();
    });
    test('deserialize restores ref', () => {
        const world = new World();
        world.registerObject(TestObject);
        const object1 = world.create(TestObject, 'object1');
        const object2Ref = world.createRef(TestObject, 'object2');
        object1.ref = object2Ref;

        const serializedWorld = world.serialize();
        const newWorld = new World().registerObject(TestObject).deserialize(serializedWorld);
        expect(newWorld.get<TestObject>('object1')?.ref?.get()).toBe(newWorld.get('object2'));
    });
});
