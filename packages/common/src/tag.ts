export function newTag<TargetT extends object, MetadataT>(
    name: string,
): [
    (target: TargetT, value: MetadataT) => void,
    (target: TargetT | undefined | null) => MetadataT | undefined,
] {
    const registry = new WeakMap<TargetT, MetadataT>();
    return [
        (target, value) => {
            registry.set(target, value);
        },
        (target) => {
            if (target == undefined) {
                return undefined;
            }
            return registry.get(target);
        },
    ];
}
