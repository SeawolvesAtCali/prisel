import { Packet } from '@prisel/client';

export type PacketBuilder = (...args: any[]) => Packet;
export interface TypedCommand {
    title: string;
    code: PacketBuilder;
    tokens: string[];
}

export function isTypedCommand(arg: any): arg is TypedCommand {
    if (typeof arg !== 'object' || arg === null) {
        return false;
    }
    return (
        typeof arg.title === 'string' && typeof arg.code === 'function' && Array.isArray(arg.tokens)
    );
}
