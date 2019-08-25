import GameObject, { FlatGameObject } from '../src/GameObject';
import { log } from '../src/logGameObject';

test('logGameObject', () => {
    const id = '123';
    class Child extends GameObject {
        public id: string;
        @log
        public run() {
            expect(this.id).toBe(id);
        }
        public flat(): FlatGameObject {
            expect(this.id).toBe(id);
            return {
                id: this.id,
            };
        }
    }
    const child = new Child();
    child.id = id;
    child.run();
});
