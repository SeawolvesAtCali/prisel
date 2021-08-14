// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Monopoly.Schema
{

using global::System;
using global::System.Collections.Generic;
using global::FlatBuffers;

public struct RollResponse : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_2_0_0(); }
  public static RollResponse GetRootAsRollResponse(ByteBuffer _bb) { return GetRootAsRollResponse(_bb, new RollResponse()); }
  public static RollResponse GetRootAsRollResponse(ByteBuffer _bb, RollResponse obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public RollResponse __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public int Steps { get { int o = __p.__offset(4); return o != 0 ? __p.bb.GetInt(o + __p.bb_pos) : (int)0; } }

  public static Offset<Monopoly.Schema.RollResponse> CreateRollResponse(FlatBufferBuilder builder,
      int steps = 0) {
    builder.StartTable(1);
    RollResponse.AddSteps(builder, steps);
    return RollResponse.EndRollResponse(builder);
  }

  public static void StartRollResponse(FlatBufferBuilder builder) { builder.StartTable(1); }
  public static void AddSteps(FlatBufferBuilder builder, int steps) { builder.AddInt(0, steps, 0); }
  public static Offset<Monopoly.Schema.RollResponse> EndRollResponse(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Monopoly.Schema.RollResponse>(o);
  }
};


}
