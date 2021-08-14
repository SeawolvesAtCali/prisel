// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Monopoly.Schema
{

using global::System;
using global::System.Collections.Generic;
using global::FlatBuffers;

public struct PayRentExtra : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_2_0_0(); }
  public static PayRentExtra GetRootAsPayRentExtra(ByteBuffer _bb) { return GetRootAsPayRentExtra(_bb, new PayRentExtra()); }
  public static PayRentExtra GetRootAsPayRentExtra(ByteBuffer _bb, PayRentExtra obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public PayRentExtra __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public Monopoly.Schema.GamePlayer? Payer { get { int o = __p.__offset(4); return o != 0 ? (Monopoly.Schema.GamePlayer?)(new Monopoly.Schema.GamePlayer()).__assign(__p.__indirect(o + __p.bb_pos), __p.bb) : null; } }
  public Monopoly.Schema.GamePlayer? Payee { get { int o = __p.__offset(6); return o != 0 ? (Monopoly.Schema.GamePlayer?)(new Monopoly.Schema.GamePlayer()).__assign(__p.__indirect(o + __p.bb_pos), __p.bb) : null; } }

  public static Offset<Monopoly.Schema.PayRentExtra> CreatePayRentExtra(FlatBufferBuilder builder,
      Offset<Monopoly.Schema.GamePlayer> payerOffset = default(Offset<Monopoly.Schema.GamePlayer>),
      Offset<Monopoly.Schema.GamePlayer> payeeOffset = default(Offset<Monopoly.Schema.GamePlayer>)) {
    builder.StartTable(2);
    PayRentExtra.AddPayee(builder, payeeOffset);
    PayRentExtra.AddPayer(builder, payerOffset);
    return PayRentExtra.EndPayRentExtra(builder);
  }

  public static void StartPayRentExtra(FlatBufferBuilder builder) { builder.StartTable(2); }
  public static void AddPayer(FlatBufferBuilder builder, Offset<Monopoly.Schema.GamePlayer> payerOffset) { builder.AddOffset(0, payerOffset.Value, 0); }
  public static void AddPayee(FlatBufferBuilder builder, Offset<Monopoly.Schema.GamePlayer> payeeOffset) { builder.AddOffset(1, payeeOffset.Value, 0); }
  public static Offset<Monopoly.Schema.PayRentExtra> EndPayRentExtra(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Monopoly.Schema.PayRentExtra>(o);
  }
};


}
