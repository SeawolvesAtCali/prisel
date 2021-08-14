// <auto-generated>
//  automatically generated by the FlatBuffers compiler, do not modify
// </auto-generated>

namespace Prisel.Common
{

using global::System;
using global::System.Collections.Generic;
using global::FlatBuffers;

public struct Packet : IFlatbufferObject
{
  private Table __p;
  public ByteBuffer ByteBuffer { get { return __p.bb; } }
  public static void ValidateVersion() { FlatBufferConstants.FLATBUFFERS_2_0_0(); }
  public static Packet GetRootAsPacket(ByteBuffer _bb) { return GetRootAsPacket(_bb, new Packet()); }
  public static Packet GetRootAsPacket(ByteBuffer _bb, Packet obj) { return (obj.__assign(_bb.GetInt(_bb.Position) + _bb.Position, _bb)); }
  public void __init(int _i, ByteBuffer _bb) { __p = new Table(_i, _bb); }
  public Packet __assign(int _i, ByteBuffer _bb) { __init(_i, _bb); return this; }

  public Prisel.Common.PacketType Type { get { int o = __p.__offset(4); return o != 0 ? (Prisel.Common.PacketType)__p.bb.GetInt(o + __p.bb_pos) : Prisel.Common.PacketType.DEFAULT; } }
  public string RequestId { get { int o = __p.__offset(6); return o != 0 ? __p.__string(o + __p.bb_pos) : null; } }
#if ENABLE_SPAN_T
  public Span<byte> GetRequestIdBytes() { return __p.__vector_as_span<byte>(6, 1); }
#else
  public ArraySegment<byte>? GetRequestIdBytes() { return __p.__vector_as_arraysegment(6); }
#endif
  public byte[] GetRequestIdArray() { return __p.__vector_as_array<byte>(6); }
  public Prisel.Common.SystemActionType SystemActionType { get { int o = __p.__offset(8); return o != 0 ? (Prisel.Common.SystemActionType)__p.bb.GetInt(o + __p.bb_pos) : Prisel.Common.SystemActionType.UNSPECIFIED; } }
  public string ActionType { get { int o = __p.__offset(10); return o != 0 ? __p.__string(o + __p.bb_pos) : null; } }
#if ENABLE_SPAN_T
  public Span<byte> GetActionTypeBytes() { return __p.__vector_as_span<byte>(10, 1); }
#else
  public ArraySegment<byte>? GetActionTypeBytes() { return __p.__vector_as_arraysegment(10); }
#endif
  public byte[] GetActionTypeArray() { return __p.__vector_as_array<byte>(10); }
  public Prisel.Common.Status? Status { get { int o = __p.__offset(12); return o != 0 ? (Prisel.Common.Status?)(new Prisel.Common.Status()).__assign(__p.__indirect(o + __p.bb_pos), __p.bb) : null; } }
  public byte Payload(int j) { int o = __p.__offset(14); return o != 0 ? __p.bb.Get(__p.__vector(o) + j * 1) : (byte)0; }
  public int PayloadLength { get { int o = __p.__offset(14); return o != 0 ? __p.__vector_len(o) : 0; } }
#if ENABLE_SPAN_T
  public Span<byte> GetPayloadBytes() { return __p.__vector_as_span<byte>(14, 1); }
#else
  public ArraySegment<byte>? GetPayloadBytes() { return __p.__vector_as_arraysegment(14); }
#endif
  public byte[] GetPayloadArray() { return __p.__vector_as_array<byte>(14); }

  public static Offset<Prisel.Common.Packet> CreatePacket(FlatBufferBuilder builder,
      Prisel.Common.PacketType type = Prisel.Common.PacketType.DEFAULT,
      StringOffset request_idOffset = default(StringOffset),
      Prisel.Common.SystemActionType system_action_type = Prisel.Common.SystemActionType.UNSPECIFIED,
      StringOffset action_typeOffset = default(StringOffset),
      Offset<Prisel.Common.Status> statusOffset = default(Offset<Prisel.Common.Status>),
      VectorOffset payloadOffset = default(VectorOffset)) {
    builder.StartTable(6);
    Packet.AddPayload(builder, payloadOffset);
    Packet.AddStatus(builder, statusOffset);
    Packet.AddActionType(builder, action_typeOffset);
    Packet.AddSystemActionType(builder, system_action_type);
    Packet.AddRequestId(builder, request_idOffset);
    Packet.AddType(builder, type);
    return Packet.EndPacket(builder);
  }

  public static void StartPacket(FlatBufferBuilder builder) { builder.StartTable(6); }
  public static void AddType(FlatBufferBuilder builder, Prisel.Common.PacketType type) { builder.AddInt(0, (int)type, 0); }
  public static void AddRequestId(FlatBufferBuilder builder, StringOffset requestIdOffset) { builder.AddOffset(1, requestIdOffset.Value, 0); }
  public static void AddSystemActionType(FlatBufferBuilder builder, Prisel.Common.SystemActionType systemActionType) { builder.AddInt(2, (int)systemActionType, 0); }
  public static void AddActionType(FlatBufferBuilder builder, StringOffset actionTypeOffset) { builder.AddOffset(3, actionTypeOffset.Value, 0); }
  public static void AddStatus(FlatBufferBuilder builder, Offset<Prisel.Common.Status> statusOffset) { builder.AddOffset(4, statusOffset.Value, 0); }
  public static void AddPayload(FlatBufferBuilder builder, VectorOffset payloadOffset) { builder.AddOffset(5, payloadOffset.Value, 0); }
  public static VectorOffset CreatePayloadVector(FlatBufferBuilder builder, byte[] data) { builder.StartVector(1, data.Length, 1); for (int i = data.Length - 1; i >= 0; i--) builder.AddByte(data[i]); return builder.EndVector(); }
  public static VectorOffset CreatePayloadVectorBlock(FlatBufferBuilder builder, byte[] data) { builder.StartVector(1, data.Length, 1); builder.Add(data); return builder.EndVector(); }
  public static void StartPayloadVector(FlatBufferBuilder builder, int numElems) { builder.StartVector(1, numElems, 1); }
  public static Offset<Prisel.Common.Packet> EndPacket(FlatBufferBuilder builder) {
    int o = builder.EndTable();
    return new Offset<Prisel.Common.Packet>(o);
  }
};


}
