import { GameObject } from '../GameObject';
import { Ref } from '../ref2';
import { listGameObjectSerizable, refSerializable } from '../serializeUtil';
import { World } from '../World';

class TestObject extends GameObject {
    static TYPE = 'test';
    readonly type = 'test';
    @refSerializable
    ref?: Ref<TestObject>;
}

class TestWorld extends World {
    @listGameObjectSerizable(TestObject)
    testObjects: TestObject[] = [];

    // override
    populateSerializedFields() {
        this.testObjects = this.getAll(TestObject);
    }

    // override
    clearSerializedFields() {
        this.testObjects = [];
    }
}

describe('ref', () => {
    test('serialize', () => {
        const world = new TestWorld();
        const object1 = world.create(TestObject, 'object1');
        const object2Ref = world.createRef(TestObject, 'object2');
        object1.ref = object2Ref;
        expect(object1.serialize()).toMatchSnapshot();
    });
    test('deserialize restores ref', () => {
        const world = new TestWorld();
        const object1 = world.create(TestObject, 'object1');
        const object2Ref = world.createRef(TestObject, 'object2');
        object1.ref = object2Ref;

        const serializedWorld = world.serialize();
        const newWorld = new TestWorld().populate(serializedWorld);
        expect(newWorld.get<TestObject>('object1')?.ref?.get()).toBe(newWorld.get('object2'));
    });
});
