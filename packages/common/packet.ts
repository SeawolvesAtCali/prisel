import { packet, packet_type, payload, system_action_type } from '@prisel/protos';

export type Packet = packet.Packet;

type SelectOneOf<
    Key extends string,
    OneofCase extends { $case: string; [key: string]: any }
> = OneofCase extends { $case: Key } ? OneofCase[Key] : never;

type OneofPayload<Key extends string> = SelectOneOf<Key, payload.Payload['payload']>;

type PayloadKey = payload.Payload['payload']['$case'];

export class PacketBuilder {
    message: 'systemAction' | 'action';
    systemAction: system_action_type.SystemActionType;
    action: string;
    payload?: payload.Payload;

    public static forSystemAction(action: system_action_type.SystemActionType) {
        const builder = new PacketBuilder();
        builder.message = 'systemAction';
        builder.systemAction = action;
        return builder;
    }

    public static forAction(action: string) {
        const builder = new PacketBuilder();
        builder.message = 'action';
        builder.action = action;
        return builder;
    }

    public setPayload<T extends PayloadKey>(payloadType: T, payload: OneofPayload<T>): this {
        this.payload = ({
            payload: {
                $case: payloadType,
                [payloadType]: payload,
            },
        } as unknown) as payload.Payload;
        return this;
    }

    public build(): packet.Packet {
        const result: packet.Packet = {
            type: packet_type.PacketType.DEFAULT,
            message:
                this.message === 'systemAction'
                    ? {
                          $case: 'systemAction',
                          systemAction: this.systemAction,
                      }
                    : {
                          $case: 'action',
                          action: this.action,
                      },
        };
        if (this.payload) {
            result.payload = this.payload;
        }
        return result;
    }
}

export const Packet = {
    forSystemAction(action: system_action_type.SystemActionType) {
        return PacketBuilder.forSystemAction(action);
    },
    forAction(action: string) {
        return PacketBuilder.forAction(action);
    },
    isSystemAction(
        packet: Packet,
    ): packet is Packet & {
        message: { $case: 'systemAction'; systemAction: system_action_type.SystemActionType };
    } {
        return packet.message.$case === 'systemAction';
    },
    isCustomAction(
        packet: Packet,
    ): packet is Packet & {
        message: { $case: 'action'; action: string };
    } {
        return packet.message.$case === 'action';
    },
};
