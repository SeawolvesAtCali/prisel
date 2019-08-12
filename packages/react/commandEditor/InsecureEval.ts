// Used to evaluate javascript submitted by current user. There are ways to bypass the sandbox so it should never be used to eval external code.
// Reference https://blog.risingstack.com/writing-a-javascript-framework-sandboxed-code-evaluation/

function get(target: Map<string, symbol>, key: string) {
    return target.get('' + key);
}

function has(target, key) {
    return true;
}

export default function compile(src: string) {
    const sandboxedSrc = `with (sandbox) { return (${src});}`;

    const code = new Function('sandbox', sandboxedSrc);

    return (context: Map<string, symbol>) => {
        const sandboxProxy = new Proxy(context, { has, get });
        return code(sandboxProxy);
    };
}
