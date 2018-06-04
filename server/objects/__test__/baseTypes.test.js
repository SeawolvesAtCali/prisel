const Types = require('../baseTypes');
const { error } = require('../typeError');

jest.mock('../typeError');

describe('baseTypes type checking', () => {
    beforeEach(() => {
        error.mockImplementation(() => '').mockName('error');
        error.mockClear();
    });

    describe('isString', () => {
        it('success', () => {
            Types.isString('hello');
            expect(error).not.toHaveBeenCalled();
        });
        it('fail', () => {
            Types.isString(12);
            expect(error).toHaveBeenCalledWith('String', 12, '');
        });
    });

    describe('isInteger', () => {
        it('success', () => {
            Types.isInteger(12);
            expect(error).not.toHaveBeenCalled();
        });
        it('fail', () => {
            Types.isInteger('12');
            expect(error).toHaveBeenCalledWith('Integer', '12', '');
        });
    });

    describe('isBoolean', () => {
        it('success', () => {
            Types.isBoolean(true);
            expect(error).not.toHaveBeenCalled();
        });
        it('fail', () => {
            Types.isBoolean(12);
            expect(error).toHaveBeenCalledWith('Boolean', 12, '');
        });
    });

    describe('isNumber', () => {
        it('success', () => {
            Types.isNumber(12);
            expect(error).not.toHaveBeenCalled();
        });
        it('fail', () => {
            Types.isNumber('12');
            expect(error).toHaveBeenCalledWith('Number', '12', '');
        });
    });

    describe('Optional', () => {
        it('success', () => {
            Types.Optional(Types.isNumber)(undefined);
            expect(error).not.toHaveBeenCalled();
        });
        it('fail', () => {
            Types.Optional(Types.isNumber)('12');
            expect(error).toHaveBeenCalledWith('Number', '12', '');
        });
    });

    describe('isArray', () => {
        it('success', () => {
            Types.isArray([]);
            expect(error).not.toHaveBeenCalled();
        });
        it('fail', () => {
            Types.isArray('12');
            expect(error).toHaveBeenCalledWith('Array', '12', '');
        });
    });

    describe('isObject', () => {
        it('success', () => {
            Types.isObject({});
            expect(error).not.toHaveBeenCalled();
        });
        it('fail', () => {
            Types.isObject(null);
            expect(error).toHaveBeenCalledWith('Object', null, '');
        });
    });

    describe('isArrayOf', () => {
        it('success when empty', () => {
            Types.isArrayOf(Types.isNumber)([]);
            expect(error).not.toHaveBeenCalled();
        });
        it('success when all elements match', () => {
            Types.isArrayOf(Types.isString)(['first', 'second']);
            expect(error).not.toHaveBeenCalled();
        });
        it('fail when not array', () => {
            Types.isArrayOf(Types.isString)(null);
            expect(error).toHaveBeenCalledWith('Array', null, '');
        });
        it('fail when not all element match', () => {
            const failArray = ['first', 12];
            Types.isArrayOf(Types.isString)(failArray);
            expect(error).toHaveBeenCalledWith('String', 12, '[1]');
            expect(error).toHaveBeenCalledWith('ArrayOf(String)', failArray, '');
        });
    });

    describe('isObjectShape', () => {
        it('success when all props match', () => {
            const successObject = { color: 'yellow', count: 12 };
            Types.isObjectShape({ color: Types.isString, count: Types.isNumber })(successObject);
            expect(error).not.toHaveBeenCalled();
        });
        it('fail when not object', () => {
            Types.isObjectShape({ color: Types.isString, count: Types.isNumber })(12);
            expect(error).toHaveBeenCalledWith('Object', 12, '');
        });
        it('fail when prop missing', () => {
            const failObject = { color: 'yellow' };
            Types.isObjectShape({ color: Types.isString, count: Types.isNumber })(failObject);
            expect(error).toHaveBeenCalledWith('Number', undefined, '.count');
        });
    });

    describe('isObjectOf', () => {
        it('success when object empty', () => {
            const successObject = {};
            Types.isObjectOf(Types.isString)(successObject);
            expect(error).not.toHaveBeenCalled();
        });
        it('success when all props match', () => {
            const successObject = { id1: {}, id2: {} };
            Types.isObjectOf(Types.isObject)(successObject);
            expect(error).not.toHaveBeenCalled();
        });
        it('fail when at least one elements dont match', () => {
            const failObject = { id1: {}, id2: 12 };
            Types.isObjectOf(Types.isObject)(failObject);
            expect(error).toHaveBeenCalledWith('Object', 12, '.id2');
            expect(error).toHaveBeenCalledWith('ObjectOf(Object)', failObject, '');
        });
    });
});
