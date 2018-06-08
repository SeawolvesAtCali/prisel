/**
 * functions to create messages.
 * Each function should return an array.
 * The first parameter of the array is the type of the message,
 * the rest are the content
 */

module.exports = {
    getLoginAccept(userId) {
        return ['LOGIN_ACCEPT', { userId }];
    },
};
