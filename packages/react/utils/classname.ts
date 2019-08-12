function toArray(item: any): string[] {
    if (typeof item === 'string' && item !== '') {
        return [item];
    }
    if (Array.isArray(item)) {
        return (item.map(toArray) as any).flat();
    }
    if (typeof item === 'object') {
        return toArray(
            (Object as any)
                .entries(item)
                .filter(([key, value]) => value)
                .map(([key]) => key),
        );
    }
    return [];
}
export default function classname(...rest: any[]) {
    return toArray(rest).join(' ');
}
