// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class PlayerAmountTuple {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):PlayerAmountTuple {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsPlayerAmountTuple(bb:flatbuffers.ByteBuffer, obj?:PlayerAmountTuple):PlayerAmountTuple {
  return (obj || new PlayerAmountTuple()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsPlayerAmountTuple(bb:flatbuffers.ByteBuffer, obj?:PlayerAmountTuple):PlayerAmountTuple {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new PlayerAmountTuple()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

player():string|null
player(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
player(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

amount():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

static startPlayerAmountTuple(builder:flatbuffers.Builder) {
  builder.startObject(2);
}

static addPlayer(builder:flatbuffers.Builder, playerOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, playerOffset, 0);
}

static addAmount(builder:flatbuffers.Builder, amount:number) {
  builder.addFieldInt32(1, amount, 0);
}

static endPlayerAmountTuple(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createPlayerAmountTuple(builder:flatbuffers.Builder, playerOffset:flatbuffers.Offset, amount:number):flatbuffers.Offset {
  PlayerAmountTuple.startPlayerAmountTuple(builder);
  PlayerAmountTuple.addPlayer(builder, playerOffset);
  PlayerAmountTuple.addAmount(builder, amount);
  return PlayerAmountTuple.endPlayerAmountTuple(builder);
}
}
