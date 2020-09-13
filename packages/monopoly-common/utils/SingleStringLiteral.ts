import { UnionToIntersection } from './UnionToIntersection';

export type SingleStringLiteral<StringLiteralT> = [StringLiteralT] extends [
    UnionToIntersection<StringLiteralT>,
] &
    [String]
    ? StringLiteralT
    : never;

// test
type a = SingleStringLiteral<'a'>; // 'a'
type b = SingleStringLiteral<1>; // never
type c = SingleStringLiteral<'a' | 'b'>; // never
