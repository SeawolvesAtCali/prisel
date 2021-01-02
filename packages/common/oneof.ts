export type SelectOneOf<
    Key extends string,
    OneofKind extends { oneofKind: string | undefined; [key: string]: any }
> = OneofKind extends { oneofKind: Key } ? OneofKind[Key] : never;

export type NotUndefined<T> = T extends undefined ? never : T;
export type NotNull<T> = T extends null ? never : T;
export type NotNullOrUndefined<T> = NotUndefined<NotNull<T>>;
