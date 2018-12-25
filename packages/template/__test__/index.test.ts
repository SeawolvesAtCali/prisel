import hello from '../index';

describe('@prisel/template', () => {
    it('should say hello', () => {
        expect(hello).toBe('Hello world');
    });
});
