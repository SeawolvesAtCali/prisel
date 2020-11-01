const { ACTION_CONFIG } = require('./lib/actionConfigs.cjs.js');
const fs = require('fs');

// print table header
const headers = [
    'action',
    'initiator',
    'description',
    'payload',
    'is request/response',
    'related actions',
];

const content = [
    `| ${headers.join(' | ')} |`,
    '|'
        .repeat(headers.length + 1)
        .split('')
        .join('---'),
    ...ACTION_CONFIG.map((config) => {
        const name = config.type;
        const initiator = config.from;
        const description = config.desc;
        const isRequestResponse = config.isRest ? '✓' : '';
        const relatedActions = (config.related || []).join(' ');
        const payload = [];
        if (config.payload) {
            config.payload.forEach((configPayload) => {
                payload.push(`**${configPayload[0]}**:${configPayload[1]}`);
            });
        }
        return `| ${[
            name,
            initiator,
            description,
            payload.join(' '),
            isRequestResponse,
            relatedActions,
        ].join(' | ')} |`;
    }),
];

fs.writeFile('./STANDARD_ACTIONS.md', content.join('\n'), (err) => {
    if (err) {
        process.exit(2);
    }
});
