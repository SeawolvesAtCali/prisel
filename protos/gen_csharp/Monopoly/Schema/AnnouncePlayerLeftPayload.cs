// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Monopoly.Schema
{

using global::System;
using global::System.Collections.Generic;
using global::FlatBuffers;

public struct AnnouncePlayerLeftPayload : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_2_0_0(); }
  public static AnnouncePlayerLeftPayload GetRootAsAnnouncePlayerLeftPayload(ByteBuffer _bb) { return GetRootAsAnnouncePlayerLeftPayload(_bb, new AnnouncePlayerLeftPayload()); }
  public static AnnouncePlayerLeftPayload GetRootAsAnnouncePlayerLeftPayload(ByteBuffer _bb, AnnouncePlayerLeftPayload obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public AnnouncePlayerLeftPayload __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public Monopoly.Schema.GamePlayer? Player { get { int o = __p.__offset(4); return o != 0 ? (Monopoly.Schema.GamePlayer?)(new Monopoly.Schema.GamePlayer()).__assign(__p.__indirect(o + __p.bb_pos), __p.bb) : null; } }

  public static Offset<Monopoly.Schema.AnnouncePlayerLeftPayload> CreateAnnouncePlayerLeftPayload(FlatBufferBuilder builder,
      Offset<Monopoly.Schema.GamePlayer> playerOffset = default(Offset<Monopoly.Schema.GamePlayer>)) {
    builder.StartTable(1);
    AnnouncePlayerLeftPayload.AddPlayer(builder, playerOffset);
    return AnnouncePlayerLeftPayload.EndAnnouncePlayerLeftPayload(builder);
  }

  public static void StartAnnouncePlayerLeftPayload(FlatBufferBuilder builder) { builder.StartTable(1); }
  public static void AddPlayer(FlatBufferBuilder builder, Offset<Monopoly.Schema.GamePlayer> playerOffset) { builder.AddOffset(0, playerOffset.Value, 0); }
  public static Offset<Monopoly.Schema.AnnouncePlayerLeftPayload> EndAnnouncePlayerLeftPayload(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Monopoly.Schema.AnnouncePlayerLeftPayload>(o);
  }
};


}
