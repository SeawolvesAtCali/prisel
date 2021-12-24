// <auto-generated>
//     Generated by the protocol buffer compiler.  DO NOT EDIT!
//     source: prisel/join_spec.proto
// </auto-generated>
#pragma warning disable 1591, 0612, 3021
#region Designer generated code

using pb = global::Google.Protobuf;
using pbc = global::Google.Protobuf.Collections;
using pbr = global::Google.Protobuf.Reflection;
using scg = global::System.Collections.Generic;
namespace Prisel.Protobuf {

  /// <summary>Holder for reflection information generated from prisel/join_spec.proto</summary>
  public static partial class JoinSpecReflection {

    #region Descriptor
    /// <summary>File descriptor for prisel/join_spec.proto</summary>
    public static pbr::FileDescriptor Descriptor {
      get { return descriptor; }
    }
    private static pbr::FileDescriptor descriptor;

    static JoinSpecReflection() {
      byte[] descriptorData = global::System.Convert.FromBase64String(
          string.Concat(
            "ChZwcmlzZWwvam9pbl9zcGVjLnByb3RvEgZwcmlzZWwaFnByaXNlbC9yb29t",
            "X2luZm8ucHJvdG8aIHByaXNlbC9yb29tX3N0YXRlX3NuYXBzaG90LnByb3Rv",
            "Ih0KC0pvaW5SZXF1ZXN0Eg4KBnJvb21JZBgBIAEoCSJcCgxKb2luUmVzcG9u",
            "c2USHgoEcm9vbRgBIAEoCzIQLnByaXNlbC5Sb29tSW5mbxIsCglyb29tU3Rh",
            "dGUYAiABKAsyGS5wcmlzZWwuUm9vbVN0YXRlU25hcHNob3RCEqoCD1ByaXNl",
            "bC5Qcm90b2J1ZmIGcHJvdG8z"));
      descriptor = pbr::FileDescriptor.FromGeneratedCode(descriptorData,
          new pbr::FileDescriptor[] { global::Prisel.Protobuf.RoomInfoReflection.Descriptor, global::Prisel.Protobuf.RoomStateSnapshotReflection.Descriptor, },
          new pbr::GeneratedClrTypeInfo(null, null, new pbr::GeneratedClrTypeInfo[] {
            new pbr::GeneratedClrTypeInfo(typeof(global::Prisel.Protobuf.JoinRequest), global::Prisel.Protobuf.JoinRequest.Parser, new[]{ "RoomId" }, null, null, null, null),
            new pbr::GeneratedClrTypeInfo(typeof(global::Prisel.Protobuf.JoinResponse), global::Prisel.Protobuf.JoinResponse.Parser, new[]{ "Room", "RoomState" }, null, null, null, null)
          }));
    }
    #endregion

  }
  #region Messages
  /// <summary>
  /// type : JOIN,
  /// packet_type : REQUEST
  /// </summary>
  public sealed partial class JoinRequest : pb::IMessage<JoinRequest>
  #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      , pb::IBufferMessage
  #endif
  {
    private static readonly pb::MessageParser<JoinRequest> _parser = new pb::MessageParser<JoinRequest>(() => new JoinRequest());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pb::MessageParser<JoinRequest> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Prisel.Protobuf.JoinSpecReflection.Descriptor.MessageTypes[0]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public JoinRequest() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public JoinRequest(JoinRequest other) : this() {
      roomId_ = other.roomId_;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public JoinRequest Clone() {
      return new JoinRequest(this);
    }

    /// <summary>Field number for the "roomId" field.</summary>
    public const int RoomIdFieldNumber = 1;
    private string roomId_ = "";
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public string RoomId {
      get { return roomId_; }
      set {
        roomId_ = pb::ProtoPreconditions.CheckNotNull(value, "value");
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override bool Equals(object other) {
      return Equals(other as JoinRequest);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public bool Equals(JoinRequest other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (RoomId != other.RoomId) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override int GetHashCode() {
      int hash = 1;
      if (RoomId.Length != 0) hash ^= RoomId.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void WriteTo(pb::CodedOutputStream output) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      output.WriteRawMessage(this);
    #else
      if (RoomId.Length != 0) {
        output.WriteRawTag(10);
        output.WriteString(RoomId);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    void pb::IBufferMessage.InternalWriteTo(ref pb::WriteContext output) {
      if (RoomId.Length != 0) {
        output.WriteRawTag(10);
        output.WriteString(RoomId);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(ref output);
      }
    }
    #endif

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CalculateSize() {
      int size = 0;
      if (RoomId.Length != 0) {
        size += 1 + pb::CodedOutputStream.ComputeStringSize(RoomId);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(JoinRequest other) {
      if (other == null) {
        return;
      }
      if (other.RoomId.Length != 0) {
        RoomId = other.RoomId;
      }
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(pb::CodedInputStream input) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      input.ReadRawMessage(this);
    #else
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
        switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10: {
            RoomId = input.ReadString();
            break;
          }
        }
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    void pb::IBufferMessage.InternalMergeFrom(ref pb::ParseContext input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
        switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, ref input);
            break;
          case 10: {
            RoomId = input.ReadString();
            break;
          }
        }
      }
    }
    #endif

  }

  /// <summary>
  /// type : JOIN,
  /// packet_type : RESPONSE
  /// </summary>
  public sealed partial class JoinResponse : pb::IMessage<JoinResponse>
  #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      , pb::IBufferMessage
  #endif
  {
    private static readonly pb::MessageParser<JoinResponse> _parser = new pb::MessageParser<JoinResponse>(() => new JoinResponse());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pb::MessageParser<JoinResponse> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Prisel.Protobuf.JoinSpecReflection.Descriptor.MessageTypes[1]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public JoinResponse() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public JoinResponse(JoinResponse other) : this() {
      room_ = other.room_ != null ? other.room_.Clone() : null;
      roomState_ = other.roomState_ != null ? other.roomState_.Clone() : null;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public JoinResponse Clone() {
      return new JoinResponse(this);
    }

    /// <summary>Field number for the "room" field.</summary>
    public const int RoomFieldNumber = 1;
    private global::Prisel.Protobuf.RoomInfo room_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Prisel.Protobuf.RoomInfo Room {
      get { return room_; }
      set {
        room_ = value;
      }
    }

    /// <summary>Field number for the "roomState" field.</summary>
    public const int RoomStateFieldNumber = 2;
    private global::Prisel.Protobuf.RoomStateSnapshot roomState_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Prisel.Protobuf.RoomStateSnapshot RoomState {
      get { return roomState_; }
      set {
        roomState_ = value;
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override bool Equals(object other) {
      return Equals(other as JoinResponse);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public bool Equals(JoinResponse other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (!object.Equals(Room, other.Room)) return false;
      if (!object.Equals(RoomState, other.RoomState)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override int GetHashCode() {
      int hash = 1;
      if (room_ != null) hash ^= Room.GetHashCode();
      if (roomState_ != null) hash ^= RoomState.GetHashCode();
      if (_unknownFields != null) {
        hash ^= _unknownFields.GetHashCode();
      }
      return hash;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override string ToString() {
      return pb::JsonFormatter.ToDiagnosticString(this);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void WriteTo(pb::CodedOutputStream output) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      output.WriteRawMessage(this);
    #else
      if (room_ != null) {
        output.WriteRawTag(10);
        output.WriteMessage(Room);
      }
      if (roomState_ != null) {
        output.WriteRawTag(18);
        output.WriteMessage(RoomState);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    void pb::IBufferMessage.InternalWriteTo(ref pb::WriteContext output) {
      if (room_ != null) {
        output.WriteRawTag(10);
        output.WriteMessage(Room);
      }
      if (roomState_ != null) {
        output.WriteRawTag(18);
        output.WriteMessage(RoomState);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(ref output);
      }
    }
    #endif

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CalculateSize() {
      int size = 0;
      if (room_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(Room);
      }
      if (roomState_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(RoomState);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(JoinResponse other) {
      if (other == null) {
        return;
      }
      if (other.room_ != null) {
        if (room_ == null) {
          Room = new global::Prisel.Protobuf.RoomInfo();
        }
        Room.MergeFrom(other.Room);
      }
      if (other.roomState_ != null) {
        if (roomState_ == null) {
          RoomState = new global::Prisel.Protobuf.RoomStateSnapshot();
        }
        RoomState.MergeFrom(other.RoomState);
      }
      _unknownFields = pb::UnknownFieldSet.MergeFrom(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(pb::CodedInputStream input) {
    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      input.ReadRawMessage(this);
    #else
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
        switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, input);
            break;
          case 10: {
            if (room_ == null) {
              Room = new global::Prisel.Protobuf.RoomInfo();
            }
            input.ReadMessage(Room);
            break;
          }
          case 18: {
            if (roomState_ == null) {
              RoomState = new global::Prisel.Protobuf.RoomStateSnapshot();
            }
            input.ReadMessage(RoomState);
            break;
          }
        }
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    void pb::IBufferMessage.InternalMergeFrom(ref pb::ParseContext input) {
      uint tag;
      while ((tag = input.ReadTag()) != 0) {
        switch(tag) {
          default:
            _unknownFields = pb::UnknownFieldSet.MergeFieldFrom(_unknownFields, ref input);
            break;
          case 10: {
            if (room_ == null) {
              Room = new global::Prisel.Protobuf.RoomInfo();
            }
            input.ReadMessage(Room);
            break;
          }
          case 18: {
            if (roomState_ == null) {
              RoomState = new global::Prisel.Protobuf.RoomStateSnapshot();
            }
            input.ReadMessage(RoomState);
            break;
          }
        }
      }
    }
    #endif

  }

  #endregion

}

#endregion Designer generated code
