import { SingleStringLiteral } from './SingleStringLiteral';

export type SingleKeyObject<ObjectT, KeyT> = [keyof ObjectT, KeyT] extends [
    SingleStringLiteral<KeyT>,
    SingleStringLiteral<KeyT>,
]
    ? ObjectT
    : never;

// test
type baseCase = SingleKeyObject<{ a: string }, 'a'>; // {a: string}
type differentKey = SingleKeyObject<{ a: string }, 'b'>; // never
type multipleKeys = SingleKeyObject<{ a: string; b: string }, 'a'>; // never
type unionStringLiteralKey = SingleKeyObject<{ a: string }, 'a' | 'b'>; // never
type multipleKeysAndUnionStringLiteral = SingleKeyObject<{ a: string; b: string }, 'a' | 'b'>; // never
