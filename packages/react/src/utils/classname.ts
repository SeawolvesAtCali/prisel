function toArray(item: any): string[] {
    if (typeof item === 'string' && item !== '') {
        return [item];
    }
    if (Array.isArray(item)) {
        return item.map(toArray).flat();
    }
    if (typeof item === 'object') {
        return toArray(
            Object.entries(item)
                .filter(([, value]) => value)
                .map(([key]) => key),
        );
    }
    return [];
}
export default function classname(...rest: any[]) {
    return toArray(rest).join(' ');
}
