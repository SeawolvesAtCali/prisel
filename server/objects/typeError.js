module.exports = {
    error(type, value, path) {
        return `Expect ${path} to be ${type}, but found ${value}`;
    },
    errorIfChildError(parentErrors = [], childErrors = []) {
        if (childErrors.length > 0) {
            return parentErrors.concat(childErrors);
        }
        return [];
    },
};
