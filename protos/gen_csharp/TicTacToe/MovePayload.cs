// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace TicTacToe
{

using global::System;
using global::System.Collections.Generic;
using global::FlatBuffers;

public struct MovePayload : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_2_0_0(); }
  public static MovePayload GetRootAsMovePayload(ByteBuffer _bb) { return GetRootAsMovePayload(_bb, new MovePayload()); }
  public static MovePayload GetRootAsMovePayload(ByteBuffer _bb, MovePayload obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public MovePayload __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public uint Position { get { int o = __p.__offset(4); return o != 0 ? __p.bb.GetUint(o + __p.bb_pos) : (uint)0; } }

  public static Offset<TicTacToe.MovePayload> CreateMovePayload(FlatBufferBuilder builder,
      uint position = 0) {
    builder.StartTable(1);
    MovePayload.AddPosition(builder, position);
    return MovePayload.EndMovePayload(builder);
  }

  public static void StartMovePayload(FlatBufferBuilder builder) { builder.StartTable(1); }
  public static void AddPosition(FlatBufferBuilder builder, uint position) { builder.AddUint(0, position, 0); }
  public static Offset<TicTacToe.MovePayload> EndMovePayload(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<TicTacToe.MovePayload>(o);
  }
};


}
