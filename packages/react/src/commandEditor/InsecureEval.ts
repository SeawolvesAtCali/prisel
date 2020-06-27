// Used to evaluate javascript submitted by current user. There are ways to bypass the sandbox so it should never be used to eval external code.
// Reference https://blog.risingstack.com/writing-a-javascript-framework-sandboxed-code-evaluation/

function get(target: Map<string, any>, key: string | symbol) {
    if (key === Symbol.unscopables) {
        return undefined;
    }
    if (typeof key === 'string') {
        return target.get(key);
    }
}

function has(target: any, key: string) {
    return true;
}

export default function compile(src: string) {
    const sandboxedSrc = `with (sandbox) { return (${src});}`;

    // eslint-disable-next-line no-new-func
    const code = new Function('sandbox', sandboxedSrc);

    return (context: Map<string, any>) => {
        const sandboxProxy = new Proxy(context, { has, get });
        return code(sandboxProxy);
    };
}
