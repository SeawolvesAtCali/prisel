// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { Coordinate } from '../../monopoly/schema/coordinate';
import { GamePlayer } from '../../monopoly/schema/game-player';
import { TeleportVehicle } from '../../monopoly/schema/teleport-vehicle';


export class TeleportDropoffExtra {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):TeleportDropoffExtra {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsTeleportDropoffExtra(bb:flatbuffers.ByteBuffer, obj?:TeleportDropoffExtra):TeleportDropoffExtra {
  return (obj || new TeleportDropoffExtra()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsTeleportDropoffExtra(bb:flatbuffers.ByteBuffer, obj?:TeleportDropoffExtra):TeleportDropoffExtra {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new TeleportDropoffExtra()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

vehicle():TeleportVehicle {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : TeleportVehicle.UNSPECIFIED;
}

dropoffLocation(obj?:Coordinate):Coordinate|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? (obj || new Coordinate()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null;
}

player(obj?:GamePlayer):GamePlayer|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? (obj || new GamePlayer()).__init(this.bb!.__indirect(this.bb_pos + offset), this.bb!) : null;
}

static startTeleportDropoffExtra(builder:flatbuffers.Builder) {
  builder.startObject(3);
}

static addVehicle(builder:flatbuffers.Builder, vehicle:TeleportVehicle) {
  builder.addFieldInt32(0, vehicle, TeleportVehicle.UNSPECIFIED);
}

static addDropoffLocation(builder:flatbuffers.Builder, dropoffLocationOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, dropoffLocationOffset, 0);
}

static addPlayer(builder:flatbuffers.Builder, playerOffset:flatbuffers.Offset) {
  builder.addFieldOffset(2, playerOffset, 0);
}

static endTeleportDropoffExtra(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

}
