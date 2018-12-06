import path from 'path';
import { spawn } from 'child_process';
import debugPkg from 'debug';

const debug = debugPkg('debug');
/**
 * Run a node script using ts-node. Only works in unix environment
 * Options:
 *      onExit: callback function triggered when the process is exiting
 *      prefix: label to show when process prints to stdout or stderr
 *      params: additional command line parameters to pass to the script
 *      maxTimeout: time it takes to kill the process if it hangs
 * @param {string} scriptPath the path of the script. Recommend using absolute path
 * @param {*} options
 */
export function run(
    scriptPath: string,
    {
        onExit,
        prefix,
        params = [],
        maxTimeout = 10000,
    }: {
        onExit?: (code: number | void, signal: string | void) => void;
        prefix?: string;
        params?: string[];
        maxTimeout?: number;
    },
) {
    const env = { ...process.env, DEBUG_HIDE_DATE: 'true' };
    const label = prefix || path.basename(scriptPath);
    const child = spawn(
        path.resolve(__dirname, '../node_modules/.bin/ts-node'),
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
 * Run a function that returns a promise of execution result. If the promise rejects, throw error.
 * @param {() => Promise<any>} func A function to execute, the function should return a promise.
 * @param {Object} options options.
 */
export function runFunc(
    func: () => Promise<void>,
    {
        onExit,
        maxTimeout = 10000,
    }: {
        onExit?: () => void;
        maxTimeout?: number;
    },
): Promise<void> {
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
                debug('error exiting');
                onExit();
            }
            throw error;
        });
}

/**
 * Start a server in a child process, return the process.
 */
export function startServer() {
    const serverProcess = run(path.resolve(__dirname, '../server/index.ts'), {
        maxTimeout: 8000,
        prefix: 'server',
    });
    return serverProcess;
}
