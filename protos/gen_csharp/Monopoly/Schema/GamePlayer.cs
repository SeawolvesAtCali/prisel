// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Monopoly.Schema
{

using global::System;
using global::System.Collections.Generic;
using global::FlatBuffers;

public struct GamePlayer : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_2_0_0(); }
  public static GamePlayer GetRootAsGamePlayer(ByteBuffer _bb) { return GetRootAsGamePlayer(_bb, new GamePlayer()); }
  public static GamePlayer GetRootAsGamePlayer(ByteBuffer _bb, GamePlayer obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public GamePlayer __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public string Id { get { int o = __p.__offset(4); return o != 0 ? __p.__string(o + __p.bb_pos) : null; } }
#if ENABLE_SPAN_T
  public Span<byte> GetIdBytes() { return __p.__vector_as_span<byte>(4, 1); }
#else
  public ArraySegment<byte>? GetIdBytes() { return __p.__vector_as_arraysegment(4); }
#endif
  public byte[] GetIdArray() { return __p.__vector_as_array<byte>(4); }
  public int Money { get { int o = __p.__offset(6); return o != 0 ? __p.bb.GetInt(o + __p.bb_pos) : (int)0; } }
  public Monopoly.Schema.Coordinate? Pos { get { int o = __p.__offset(8); return o != 0 ? (Monopoly.Schema.Coordinate?)(new Monopoly.Schema.Coordinate()).__assign(__p.__indirect(o + __p.bb_pos), __p.bb) : null; } }
  public int Character { get { int o = __p.__offset(10); return o != 0 ? __p.bb.GetInt(o + __p.bb_pos) : (int)0; } }
  public Prisel.Common.PlayerInfo? BoundPlayer { get { int o = __p.__offset(12); return o != 0 ? (Prisel.Common.PlayerInfo?)(new Prisel.Common.PlayerInfo()).__assign(__p.__indirect(o + __p.bb_pos), __p.bb) : null; } }

  public static Offset<Monopoly.Schema.GamePlayer> CreateGamePlayer(FlatBufferBuilder builder,
      StringOffset idOffset = default(StringOffset),
      int money = 0,
      Offset<Monopoly.Schema.Coordinate> posOffset = default(Offset<Monopoly.Schema.Coordinate>),
      int character = 0,
      Offset<Prisel.Common.PlayerInfo> bound_playerOffset = default(Offset<Prisel.Common.PlayerInfo>)) {
    builder.StartTable(5);
    GamePlayer.AddBoundPlayer(builder, bound_playerOffset);
    GamePlayer.AddCharacter(builder, character);
    GamePlayer.AddPos(builder, posOffset);
    GamePlayer.AddMoney(builder, money);
    GamePlayer.AddId(builder, idOffset);
    return GamePlayer.EndGamePlayer(builder);
  }

  public static void StartGamePlayer(FlatBufferBuilder builder) { builder.StartTable(5); }
  public static void AddId(FlatBufferBuilder builder, StringOffset idOffset) { builder.AddOffset(0, idOffset.Value, 0); }
  public static void AddMoney(FlatBufferBuilder builder, int money) { builder.AddInt(1, money, 0); }
  public static void AddPos(FlatBufferBuilder builder, Offset<Monopoly.Schema.Coordinate> posOffset) { builder.AddOffset(2, posOffset.Value, 0); }
  public static void AddCharacter(FlatBufferBuilder builder, int character) { builder.AddInt(3, character, 0); }
  public static void AddBoundPlayer(FlatBufferBuilder builder, Offset<Prisel.Common.PlayerInfo> boundPlayerOffset) { builder.AddOffset(4, boundPlayerOffset.Value, 0); }
  public static Offset<Monopoly.Schema.GamePlayer> EndGamePlayer(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Monopoly.Schema.GamePlayer>(o);
  }
};


}
