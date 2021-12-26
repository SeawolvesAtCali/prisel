export function safeStringify(object: any): string {
    try {
        return JSON.stringify(object);
    } catch (_) {
        return `${object}`;
    }
}
