// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class ErrorPayload {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):ErrorPayload {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsErrorPayload(bb:flatbuffers.ByteBuffer, obj?:ErrorPayload):ErrorPayload {
  return (obj || new ErrorPayload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsErrorPayload(bb:flatbuffers.ByteBuffer, obj?:ErrorPayload):ErrorPayload {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new ErrorPayload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

message():string|null
message(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
message(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

detail():string|null
detail(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
detail(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

static startErrorPayload(builder:flatbuffers.Builder) {
  builder.startObject(2);
}

static addMessage(builder:flatbuffers.Builder, messageOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, messageOffset, 0);
}

static addDetail(builder:flatbuffers.Builder, detailOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, detailOffset, 0);
}

static endErrorPayload(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createErrorPayload(builder:flatbuffers.Builder, messageOffset:flatbuffers.Offset, detailOffset:flatbuffers.Offset):flatbuffers.Offset {
  ErrorPayload.startErrorPayload(builder);
  ErrorPayload.addMessage(builder, messageOffset);
  ErrorPayload.addDetail(builder, detailOffset);
  return ErrorPayload.endErrorPayload(builder);
}
}
