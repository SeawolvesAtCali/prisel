// @flow

const PORT = 3000;
module.exports = {
    // namespaces
    // Clients connects to different namespace based on their types.
    CONTROLLER_NS: '/controller',
    DISPLAY_NS: '/display',
    CHAT_NS: '/chat',

    PORT,
    SERVER: `http://localhost:${PORT}`,
};
