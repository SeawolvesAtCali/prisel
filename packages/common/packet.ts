import { packet, packet_type, system_action_type } from '@prisel/protos';
import { AnyUtils } from './anyUtils';
import { ProtoGenInstance } from './ProtoGenInstance';

export type Packet = packet.Packet;

type T = never;
type C = T extends never ? number : string;

export class PacketBuilder<Payload = never> {
    message: 'systemAction' | 'action';
    systemAction: system_action_type.SystemActionType;
    action: string;
    payloadClass: Payload extends never ? undefined : ProtoGenInstance<Payload>;
    payload: Payload extends never ? undefined : Payload;

    public static forSystemAction<Payload = never>(action: system_action_type.SystemActionType) {
        const builder = new PacketBuilder<Payload>();
        builder.message = 'systemAction';
        builder.systemAction = action;
        return builder;
    }

    public static forAction<Payload = never>(action: string) {
        const builder = new PacketBuilder<Payload>();
        builder.message = 'action';
        builder.action = action;
        return builder;
    }

    public setPayloadClass(payloadClass: this['payloadClass']): this {
        this.payloadClass = payloadClass;
        return this;
    }

    public setPayload(payload: this['payload']): this;
    setPayload(payloadClass: this['payloadClass'], payload: this['payload']): this;
    public setPayload(
        payloadClassOrPayload: this['payload'] | this['payloadClass'],
        payload?: this['payload'],
    ): this {
        if ('typeUrl' in payloadClassOrPayload) {
            this.payloadClass = payloadClassOrPayload;
            this.payload = payload;
        } else {
            this.payload = payloadClassOrPayload;
        }
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
        if (this.payloadClass && this.payload) {
            result.payload = AnyUtils.pack(this.payload, this.payloadClass);
        }
        return result;
    }
}

export const Packet = {
    forSystemAction<Payload = never>(action: system_action_type.SystemActionType) {
        // PacketBuilder.forSystemAction<never>(action).payload = 'sd';
        return PacketBuilder.forSystemAction<Payload>(action);
    },
    forAction<Payload = never>(action: string) {
        return PacketBuilder.forAction<Payload>(action);
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
