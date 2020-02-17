import { enumToMap } from './enumToMap';

export enum Code {
    UNSPECIFIED = 0,
    OK = 1,
    FAILED = 2,
}

const codeMap = enumToMap<Code>(Code);

export function isCode(code: any): code is Code {
    return codeMap.has(code);
}

export function printCodeToString(code: Code): string {
    return codeMap.get(code);
}
