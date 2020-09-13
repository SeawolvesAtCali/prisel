// convert union type, for example A | B to intersection type A & B
// https://stackoverflow.com/a/50375286
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

// test
type a = UnionToIntersection<'a' | 'b'>; // never
type b = UnionToIntersection<'a'>; // 'a';
type c = UnionToIntersection<{ a: string } | { b: number }>; // {a: string} & {b: number}
