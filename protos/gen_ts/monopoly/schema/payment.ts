// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { PropertyInfo } from '../../monopoly/schema/property-info';


export class Payment {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):Payment {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsPayment(bb:flatbuffers.ByteBuffer, obj?:Payment):Payment {
  return (obj || new Payment()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsPayment(bb:flatbuffers.ByteBuffer, obj?:Payment):Payment {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Payment()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

payee():string|null
payee(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
payee(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

payer():string|null
payer(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
payer(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

amount():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

forProperty(obj?:PropertyInfo):PropertyInfo|null {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? (obj || new PropertyInfo()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null;
}

static startPayment(builder:flatbuffers.Builder) {
  builder.startObject(4);
}

static addPayee(builder:flatbuffers.Builder, payeeOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, payeeOffset, 0);
}

static addPayer(builder:flatbuffers.Builder, payerOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, payerOffset, 0);
}

static addAmount(builder:flatbuffers.Builder, amount:number) {
  builder.addFieldInt32(2, amount, 0);
}

static addForProperty(builder:flatbuffers.Builder, forPropertyOffset:flatbuffers.Offset) {
  builder.addFieldOffset(3, forPropertyOffset, 0);
}

static endPayment(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

}
