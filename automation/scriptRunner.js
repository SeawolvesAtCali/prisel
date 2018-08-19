// @flow

const path = require('path');
const { spawn } = require('child_process');
const debug = require('debug')('debug');

type onExitT = (code: ?number, signal: ?string) => void;

/**
 * Run a node script using flow-node. Only works in unix environment
 * Options:
 *      onExit: callback function triggered when the process is exiting
 *      prefix: label to show when process prints to stdout or stderr
 *      params: additional command line parameters to pass to the script
 *      maxTimeout: time it takes to kill the process if it hangs
 * @param {string} scriptPath the path of the script. Recommend using absolute path
 * @param {*} options
 */
function run(
    scriptPath: string,
    {
        onExit,
        prefix,
        params = [],
        maxTimeout = 10000,
    }: {
        onExit?: onExitT,
        prefix?: string,
        params?: Array<string>,
        maxTimeout?: number,
    },
) {
    const env = { ...process.env, DEBUG_HIDE_DATE: true };
    const label = prefix || path.basename(scriptPath);
    const child = spawn(
        path.resolve(__dirname, '../node_modules/.bin/flow-node'),
        [scriptPath, ...params],
        {
            env,
            stdio: ['ignore', process.stdout, process.stderr],
        },
    );

    const timeoutId = setTimeout(() => {
        child.kill();
        throw new Error(`${label} timeout at ${maxTimeout}`);
    }, maxTimeout);

    child.on('exit', (code, signal) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        if (code > 0) {
            throw new Error(`${label} failed with exit code ${code}`);
        } else {
            debug(`${label} exiting`);
        }
        if (onExit) {
            onExit(code, signal);
        }
    });
    return child;
}

/**
 * Run an autoscript
 * @param {string} autoScriptPath
 * @param {function} onExit
 */
function runScript(autoScriptPath: string, onExit: onExitT) {
    const label = path.basename(autoScriptPath);
    run(path.resolve(__dirname, '../client/sampleAutoClient.js'), {
        prefix: label,
        onExit,
        params: ['--script', autoScriptPath],
    });
}

function runFunc(
    func: () => Promise<void>,
    {
        onExit,
        maxTimeout = 10000,
    }: {
        onExit?: Function,
        maxTimeout?: number,
    },
) {
    const timeoutId = setTimeout(() => {
        if (onExit) {
            onExit();
        }
        throw new Error(`Timeout running function: ${func.toString()}`);
    }, maxTimeout);

    return func()
        .then(() => {
            debug('function finished running');
            clearTimeout(timeoutId);
            if (onExit) {
                onExit();
            }
        })
        .catch((error) => {
            clearTimeout(timeoutId);
            if (onExit) {
                onExit();
            }
            throw error;
        });
}

function startServer() {
    const serverProcess = run(path.resolve(__dirname, '../server/index.js'), {
        maxTimeout: 8000,
    });
    return serverProcess;
}

module.exports = {
    run,
    runScript,
    runFunc,
    startServer,
};
