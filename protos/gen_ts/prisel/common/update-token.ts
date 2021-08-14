// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class UpdateToken {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):UpdateToken {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsUpdateToken(bb:flatbuffers.ByteBuffer, obj?:UpdateToken):UpdateToken {
  return (obj || new UpdateToken()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsUpdateToken(bb:flatbuffers.ByteBuffer, obj?:UpdateToken):UpdateToken {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new UpdateToken()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

previousToken():string|null
previousToken(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
previousToken(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

token():string|null
token(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
token(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

static startUpdateToken(builder:flatbuffers.Builder) {
  builder.startObject(2);
}

static addPreviousToken(builder:flatbuffers.Builder, previousTokenOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, previousTokenOffset, 0);
}

static addToken(builder:flatbuffers.Builder, tokenOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, tokenOffset, 0);
}

static endUpdateToken(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createUpdateToken(builder:flatbuffers.Builder, previousTokenOffset:flatbuffers.Offset, tokenOffset:flatbuffers.Offset):flatbuffers.Offset {
  UpdateToken.startUpdateToken(builder);
  UpdateToken.addPreviousToken(builder, previousTokenOffset);
  UpdateToken.addToken(builder, tokenOffset);
  return UpdateToken.endUpdateToken(builder);
}
}
