export function enumToMap<T>(enu: object): Map<T, string> {
    return (Object as any)
        .entries(enu)
        .reduce(
            (map: Map<T, string>, [enumKey, enumValue]: [string, T]) => map.set(enumValue, enumKey),
            new Map(),
        );
}
