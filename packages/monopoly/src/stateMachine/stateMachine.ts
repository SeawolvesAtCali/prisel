import { MessageType } from '@prisel/server';

export interface StateConfig {
    name: string;
    description?: string;
    transitions?: TransitionConfig[];
}
export interface TransitionConfig {
    from?: string;
    to: string;
    condition: TransitionCondition;
}

export interface TransitionCondition {
    type: string;
}

export interface SyncPacketCondition extends TransitionCondition {
    action?: any;
    systemAction?: MessageType;
}

export interface CurrentPlayerActionCondition extends TransitionCondition {
    action?: any;
    systemAction?: MessageType;
}

export interface ServerBroadcastCondition extends TransitionCondition {
    message: string;
}

export interface SequenceCondition extends TransitionCondition {
    sequence: TransitionCondition[];
}

export function serverBroadcast(message: string): ServerBroadcastCondition {
    return {
        type: 'server_broadcast',
        message,
    };
}

export function syncAction(action: any): SyncPacketCondition {
    return {
        type: 'sync_action',
        action,
    };
}

export function syncSystemAction(systemAction: MessageType): SyncPacketCondition {
    return {
        type: 'sync_action',
        systemAction,
    };
}

export function currentPlayerAction(action: any): CurrentPlayerActionCondition {
    return {
        type: 'current_player_action',
        action,
    };
}

export function currentPlayerSystemAction(systemAction: MessageType): CurrentPlayerActionCondition {
    return {
        type: 'current_player_action',
        systemAction,
    };
}

export function sequence(...conditions: TransitionCondition[]): SequenceCondition {
    return {
        type: 'sequence',
        sequence: conditions,
    };
}
