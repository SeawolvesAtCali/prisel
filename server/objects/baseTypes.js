const assert = require('assert');
const { error } = require('./typeError');

function flatArray(array) {
    return [].concat(...array);
}

function setTypeName(func, type) {
    // eslint-disable-next-line no-param-reassign
    func.typeName = type;
    return func;
}

function isString(value, path = '') {
    return typeof value === 'string' ? [] : [error('String', value, path)];
}

function isInteger(value, path = '') {
    return Number.isInteger(value) ? [] : [error('Integer', value, path)];
}

function isBoolean(value, path = '') {
    return value === true || value === false ? [] : [error('Boolean', value, path)];
}

function Optional(typeChecker) {
    assert(typeof typeChecker === 'function');
    function validate(value, path = '') {
        if (value === undefined || value === null) {
            return [];
        }
        return typeChecker(value, path);
    }
    validate.typeName = `Optional ${typeChecker.typeName}`;
    return validate;
}

function isNumber(value, path = '') {
    return Number.isFinite(value) ? [] : [error('Number', value, path)];
}

function isArray(value, path = '') {
    return Array.isArray(value) ? [] : [error('Array', value, path)];
}

function isArrayOf(typeChecker) {
    assert(typeof typeChecker === 'function');

    function validate(value, path = '') {
        const isArrayError = isArray(value, path);
        if (isArrayError.length === 0) {
            const elementErrors = flatArray(
                value.map((element, index) => typeChecker(element, `${path}[${index}]`)),
            );
            if (elementErrors.length > 0) {
                return [error(`ArrayOf(${typeChecker.typeName})`, value, path)].concat(
                    elementErrors,
                );
            }
            return [];
        }
        return isArrayError;
    }
    validate.typeName = `Array of ${typeChecker.typeName}`;
    return validate;
}

function isObject(value, path = '') {
    return typeof value === 'object' && Array.isArray(value) === false && value !== null
        ? []
        : [error('Object', value, path)];
}

function isObjectShape(object) {
    assert(typeof object === 'object');
    function validate(value, path = '') {
        const isObjectError = isObject(value, path);

        if (isObjectError.length === 0) {
            const elementErrors = flatArray(
                Object.entries(object).map((entry) => {
                    const [key, elementTypeChecker] = entry;
                    return elementTypeChecker(value[key], `${path}.${key}`);
                }),
            );

            if (elementErrors.length > 0) {
                return elementErrors;
            }
            return [];
        }
        return [error('Object', value, path)];
    }
    validate.typeName = 'Object';
    return validate;
}

function isObjectOf(typeChecker) {
    assert(typeof typeChecker === 'function');
    function validate(value, path = '') {
        const isObjectError = isObject(value, path);

        if (isObjectError.length === 0) {
            const elementErrors = flatArray(
                Object.entries(value).map((entry) => {
                    const [key, element] = entry;
                    return typeChecker(element, `${path}.${key}`);
                }),
            );

            if (elementErrors.length > 0) {
                return [error(`ObjectOf(${typeChecker.typeName})`, value, path)].concat(
                    elementErrors,
                );
            }
            return [];
        }
        return [error('Object', value, path)];
    }
    validate.typeName = 'Object';
    return validate;
}

module.exports = {
    isString: setTypeName(isString, 'String'),
    isInteger: setTypeName(isInteger, 'Integer'),
    isBoolean: setTypeName(isBoolean, 'Boolean'),
    isNumber: setTypeName(isNumber, 'Number'),
    isArray: setTypeName(isArray, 'Array'),
    isObject: setTypeName(isObject, 'Object'),
    Optional,
    isArrayOf,
    isObjectOf,
    isObjectShape,
    setTypeName,
};
