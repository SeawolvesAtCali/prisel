// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { Rank } from '../../monopoly/schema/rank';


export class AnnounceGameOverPayload {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):AnnounceGameOverPayload {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsAnnounceGameOverPayload(bb:flatbuffers.ByteBuffer, obj?:AnnounceGameOverPayload):AnnounceGameOverPayload {
  return (obj || new AnnounceGameOverPayload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsAnnounceGameOverPayload(bb:flatbuffers.ByteBuffer, obj?:AnnounceGameOverPayload):AnnounceGameOverPayload {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new AnnounceGameOverPayload()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

ranks(index: number, obj?:Rank):Rank|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? (obj || new Rank()).__init(this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4), this.bb!) : null;
}

ranksLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

static startAnnounceGameOverPayload(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addRanks(builder:flatbuffers.Builder, ranksOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, ranksOffset, 0);
}

static createRanksVector(builder:flatbuffers.Builder, data:flatbuffers.Offset[]):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]!);
  }
  return builder.endVector();
}

static startRanksVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static endAnnounceGameOverPayload(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createAnnounceGameOverPayload(builder:flatbuffers.Builder, ranksOffset:flatbuffers.Offset):flatbuffers.Offset {
  AnnounceGameOverPayload.startAnnounceGameOverPayload(builder);
  AnnounceGameOverPayload.addRanks(builder, ranksOffset);
  return AnnounceGameOverPayload.endAnnounceGameOverPayload(builder);
}
}
