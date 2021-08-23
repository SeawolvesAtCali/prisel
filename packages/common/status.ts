import { priselpb } from '@prisel/protos';
import * as flatbuffers from 'flatbuffers';
import { nonNull } from './assert';

export class StatusBuilder {
    code = priselpb.StatusCode.UNSPECIFIED;
    message?: string;
    detail?: string;

    public static OK() {
        return new StatusBuilder().withCode(priselpb.StatusCode.OK);
    }

    public static FAILED(message?: string, detail?: string) {
        const builder = new StatusBuilder().withCode(priselpb.StatusCode.FAILED);
        if (nonNull(message)) {
            builder.withMessage(message);
        }
        if (nonNull(detail)) {
            builder.withDetail(detail);
        }
        return builder;
    }

    public withCode(code: priselpb.StatusCode) {
        this.code = code;
        return this;
    }

    public withMessage(message: string) {
        this.message = message;
        return this;
    }

    public withDetail(detail: string) {
        this.detail = detail;
        return this;
    }

    public build(fbbuilder: flatbuffers.Builder) {
        const messageOffset = nonNull(this.message)
            ? fbbuilder.createString(this.message)
            : undefined;
        const detailOffset = nonNull(this.detail) ? fbbuilder.createString(this.detail) : undefined;
        priselpb.Status.startStatus(fbbuilder);
        priselpb.Status.addCode(fbbuilder, this.code);
        if (nonNull(messageOffset)) {
            priselpb.Status.addMessage(fbbuilder, messageOffset);
        }
        if (nonNull(detailOffset)) {
            priselpb.Status.addDetail(fbbuilder, detailOffset);
        }
        return priselpb.Status.endStatus(fbbuilder);
    }
}
