export type SelectOneOf<
    Key extends string,
    OneofKind extends { oneofKind: string | undefined; [key: string]: any }
> = OneofKind extends { oneofKind: Key } ? OneofKind[Key] : never;
