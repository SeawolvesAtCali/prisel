export function newTag<TargetT extends object, MetadataT>(
    name: string,
): [(target: TargetT, value: MetadataT) => void, (target: TargetT) => MetadataT | undefined] {
    const registry = new WeakMap<TargetT, MetadataT>();
    return [
        (target, value) => {
            registry.set(target, value);
        },
        registry.get.bind(registry),
    ];
}
