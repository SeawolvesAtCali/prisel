// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { Coordinate } from '../../monopoly/schema/coordinate';


export class AnnounceRollPayload {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):AnnounceRollPayload {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsAnnounceRollPayload(bb:flatbuffers.ByteBuffer, obj?:AnnounceRollPayload):AnnounceRollPayload {
  return (obj || new AnnounceRollPayload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsAnnounceRollPayload(bb:flatbuffers.ByteBuffer, obj?:AnnounceRollPayload):AnnounceRollPayload {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new AnnounceRollPayload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

player():string|null
player(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
player(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

steps():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

currentPosition(obj?:Coordinate):Coordinate|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? (obj || new Coordinate()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null;
}

myMoney():number {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

static startAnnounceRollPayload(builder:flatbuffers.Builder) {
  builder.startObject(4);
}

static addPlayer(builder:flatbuffers.Builder, playerOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, playerOffset, 0);
}

static addSteps(builder:flatbuffers.Builder, steps:number) {
  builder.addFieldInt32(1, steps, 0);
}

static addCurrentPosition(builder:flatbuffers.Builder, currentPositionOffset:flatbuffers.Offset) {
  builder.addFieldOffset(2, currentPositionOffset, 0);
}

static addMyMoney(builder:flatbuffers.Builder, myMoney:number) {
  builder.addFieldInt32(3, myMoney, 0);
}

static endAnnounceRollPayload(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

}
