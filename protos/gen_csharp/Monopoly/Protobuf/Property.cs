// <auto-generated>
//     Generated by the protocol buffer compiler.  DO NOT EDIT!
//     source: monopoly/property.proto
// </auto-generated>
#pragma warning disable 1591, 0612, 3021
#region Designer generated code

using pb = global::Google.Protobuf;
using pbc = global::Google.Protobuf.Collections;
using pbr = global::Google.Protobuf.Reflection;
using scg = global::System.Collections.Generic;
namespace Monopoly.Protobuf {

  /// <summary>Holder for reflection information generated from monopoly/property.proto</summary>
  public static partial class PropertyReflection {

    #region Descriptor
    /// <summary>File descriptor for monopoly/property.proto</summary>
    public static pbr::FileDescriptor Descriptor {
      get { return descriptor; }
    }
    private static pbr::FileDescriptor descriptor;

    static PropertyReflection() {
      byte[] descriptorData = global::System.Convert.FromBase64String(
          string.Concat(
            "Chdtb25vcG9seS9wcm9wZXJ0eS5wcm90bxIIbW9ub3BvbHkaGW1vbm9wb2x5",
            "L2Nvb3JkaW5hdGUucHJvdG8iKwoNUHJvcGVydHlMZXZlbBIMCgRjb3N0GAEg",
            "ASgFEgwKBHJlbnQYAiABKAUicgoMUHJvcGVydHlJbmZvEhUKDWN1cnJlbnRf",
            "bGV2ZWwYASABKAUSDAoEY29zdBgCIAEoBRIMCgRyZW50GAMgASgFEgwKBG5h",
            "bWUYBCABKAkSIQoDcG9zGAUgASgLMhQubW9ub3BvbHkuQ29vcmRpbmF0ZUIU",
            "qgIRTW9ub3BvbHkuUHJvdG9idWZiBnByb3RvMw=="));
      descriptor = pbr::FileDescriptor.FromGeneratedCode(descriptorData,
          new pbr::FileDescriptor[] { global::Monopoly.Protobuf.CoordinateReflection.Descriptor, },
          new pbr::GeneratedClrTypeInfo(null, null, new pbr::GeneratedClrTypeInfo[] {
            new pbr::GeneratedClrTypeInfo(typeof(global::Monopoly.Protobuf.PropertyLevel), global::Monopoly.Protobuf.PropertyLevel.Parser, new[]{ "Cost", "Rent" }, null, null, null, null),
            new pbr::GeneratedClrTypeInfo(typeof(global::Monopoly.Protobuf.PropertyInfo), global::Monopoly.Protobuf.PropertyInfo.Parser, new[]{ "CurrentLevel", "Cost", "Rent", "Name", "Pos" }, null, null, null, null)
          }));
    }
    #endregion

  }
  #region Messages
  public sealed partial class PropertyLevel : pb::IMessage<PropertyLevel>
  #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      , pb::IBufferMessage
  #endif
  {
    private static readonly pb::MessageParser<PropertyLevel> _parser = new pb::MessageParser<PropertyLevel>(() => new PropertyLevel());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pb::MessageParser<PropertyLevel> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Monopoly.Protobuf.PropertyReflection.Descriptor.MessageTypes[0]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public PropertyLevel() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public PropertyLevel(PropertyLevel other) : this() {
      cost_ = other.cost_;
      rent_ = other.rent_;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public PropertyLevel Clone() {
      return new PropertyLevel(this);
    }

    /// <summary>Field number for the "cost" field.</summary>
    public const int CostFieldNumber = 1;
    private int cost_;
    /// <summary>
    /// The cost to reach this level from previous level
    /// If this is the first level, the cost is land purchase cost
    /// </summary>
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int Cost {
      get { return cost_; }
      set {
        cost_ = value;
      }
    }

    /// <summary>Field number for the "rent" field.</summary>
    public const int RentFieldNumber = 2;
    private int rent_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int Rent {
      get { return rent_; }
      set {
        rent_ = value;
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override bool Equals(object other) {
      return Equals(other as PropertyLevel);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public bool Equals(PropertyLevel other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (Cost != other.Cost) return false;
      if (Rent != other.Rent) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override int GetHashCode() {
      int hash = 1;
      if (Cost != 0) hash ^= Cost.GetHashCode();
      if (Rent != 0) hash ^= Rent.GetHashCode();
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
      if (Cost != 0) {
        output.WriteRawTag(8);
        output.WriteInt32(Cost);
      }
      if (Rent != 0) {
        output.WriteRawTag(16);
        output.WriteInt32(Rent);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    void pb::IBufferMessage.InternalWriteTo(ref pb::WriteContext output) {
      if (Cost != 0) {
        output.WriteRawTag(8);
        output.WriteInt32(Cost);
      }
      if (Rent != 0) {
        output.WriteRawTag(16);
        output.WriteInt32(Rent);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(ref output);
      }
    }
    #endif

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CalculateSize() {
      int size = 0;
      if (Cost != 0) {
        size += 1 + pb::CodedOutputStream.ComputeInt32Size(Cost);
      }
      if (Rent != 0) {
        size += 1 + pb::CodedOutputStream.ComputeInt32Size(Rent);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(PropertyLevel other) {
      if (other == null) {
        return;
      }
      if (other.Cost != 0) {
        Cost = other.Cost;
      }
      if (other.Rent != 0) {
        Rent = other.Rent;
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
          case 8: {
            Cost = input.ReadInt32();
            break;
          }
          case 16: {
            Rent = input.ReadInt32();
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
          case 8: {
            Cost = input.ReadInt32();
            break;
          }
          case 16: {
            Rent = input.ReadInt32();
            break;
          }
        }
      }
    }
    #endif

  }

  public sealed partial class PropertyInfo : pb::IMessage<PropertyInfo>
  #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
      , pb::IBufferMessage
  #endif
  {
    private static readonly pb::MessageParser<PropertyInfo> _parser = new pb::MessageParser<PropertyInfo>(() => new PropertyInfo());
    private pb::UnknownFieldSet _unknownFields;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pb::MessageParser<PropertyInfo> Parser { get { return _parser; } }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public static pbr::MessageDescriptor Descriptor {
      get { return global::Monopoly.Protobuf.PropertyReflection.Descriptor.MessageTypes[1]; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    pbr::MessageDescriptor pb::IMessage.Descriptor {
      get { return Descriptor; }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public PropertyInfo() {
      OnConstruction();
    }

    partial void OnConstruction();

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public PropertyInfo(PropertyInfo other) : this() {
      currentLevel_ = other.currentLevel_;
      cost_ = other.cost_;
      rent_ = other.rent_;
      name_ = other.name_;
      pos_ = other.pos_ != null ? other.pos_.Clone() : null;
      _unknownFields = pb::UnknownFieldSet.Clone(other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public PropertyInfo Clone() {
      return new PropertyInfo(this);
    }

    /// <summary>Field number for the "current_level" field.</summary>
    public const int CurrentLevelFieldNumber = 1;
    private int currentLevel_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CurrentLevel {
      get { return currentLevel_; }
      set {
        currentLevel_ = value;
      }
    }

    /// <summary>Field number for the "cost" field.</summary>
    public const int CostFieldNumber = 2;
    private int cost_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int Cost {
      get { return cost_; }
      set {
        cost_ = value;
      }
    }

    /// <summary>Field number for the "rent" field.</summary>
    public const int RentFieldNumber = 3;
    private int rent_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int Rent {
      get { return rent_; }
      set {
        rent_ = value;
      }
    }

    /// <summary>Field number for the "name" field.</summary>
    public const int NameFieldNumber = 4;
    private string name_ = "";
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public string Name {
      get { return name_; }
      set {
        name_ = pb::ProtoPreconditions.CheckNotNull(value, "value");
      }
    }

    /// <summary>Field number for the "pos" field.</summary>
    public const int PosFieldNumber = 5;
    private global::Monopoly.Protobuf.Coordinate pos_;
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public global::Monopoly.Protobuf.Coordinate Pos {
      get { return pos_; }
      set {
        pos_ = value;
      }
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override bool Equals(object other) {
      return Equals(other as PropertyInfo);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public bool Equals(PropertyInfo other) {
      if (ReferenceEquals(other, null)) {
        return false;
      }
      if (ReferenceEquals(other, this)) {
        return true;
      }
      if (CurrentLevel != other.CurrentLevel) return false;
      if (Cost != other.Cost) return false;
      if (Rent != other.Rent) return false;
      if (Name != other.Name) return false;
      if (!object.Equals(Pos, other.Pos)) return false;
      return Equals(_unknownFields, other._unknownFields);
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public override int GetHashCode() {
      int hash = 1;
      if (CurrentLevel != 0) hash ^= CurrentLevel.GetHashCode();
      if (Cost != 0) hash ^= Cost.GetHashCode();
      if (Rent != 0) hash ^= Rent.GetHashCode();
      if (Name.Length != 0) hash ^= Name.GetHashCode();
      if (pos_ != null) hash ^= Pos.GetHashCode();
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
      if (CurrentLevel != 0) {
        output.WriteRawTag(8);
        output.WriteInt32(CurrentLevel);
      }
      if (Cost != 0) {
        output.WriteRawTag(16);
        output.WriteInt32(Cost);
      }
      if (Rent != 0) {
        output.WriteRawTag(24);
        output.WriteInt32(Rent);
      }
      if (Name.Length != 0) {
        output.WriteRawTag(34);
        output.WriteString(Name);
      }
      if (pos_ != null) {
        output.WriteRawTag(42);
        output.WriteMessage(Pos);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(output);
      }
    #endif
    }

    #if !GOOGLE_PROTOBUF_REFSTRUCT_COMPATIBILITY_MODE
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    void pb::IBufferMessage.InternalWriteTo(ref pb::WriteContext output) {
      if (CurrentLevel != 0) {
        output.WriteRawTag(8);
        output.WriteInt32(CurrentLevel);
      }
      if (Cost != 0) {
        output.WriteRawTag(16);
        output.WriteInt32(Cost);
      }
      if (Rent != 0) {
        output.WriteRawTag(24);
        output.WriteInt32(Rent);
      }
      if (Name.Length != 0) {
        output.WriteRawTag(34);
        output.WriteString(Name);
      }
      if (pos_ != null) {
        output.WriteRawTag(42);
        output.WriteMessage(Pos);
      }
      if (_unknownFields != null) {
        _unknownFields.WriteTo(ref output);
      }
    }
    #endif

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public int CalculateSize() {
      int size = 0;
      if (CurrentLevel != 0) {
        size += 1 + pb::CodedOutputStream.ComputeInt32Size(CurrentLevel);
      }
      if (Cost != 0) {
        size += 1 + pb::CodedOutputStream.ComputeInt32Size(Cost);
      }
      if (Rent != 0) {
        size += 1 + pb::CodedOutputStream.ComputeInt32Size(Rent);
      }
      if (Name.Length != 0) {
        size += 1 + pb::CodedOutputStream.ComputeStringSize(Name);
      }
      if (pos_ != null) {
        size += 1 + pb::CodedOutputStream.ComputeMessageSize(Pos);
      }
      if (_unknownFields != null) {
        size += _unknownFields.CalculateSize();
      }
      return size;
    }

    [global::System.Diagnostics.DebuggerNonUserCodeAttribute]
    public void MergeFrom(PropertyInfo other) {
      if (other == null) {
        return;
      }
      if (other.CurrentLevel != 0) {
        CurrentLevel = other.CurrentLevel;
      }
      if (other.Cost != 0) {
        Cost = other.Cost;
      }
      if (other.Rent != 0) {
        Rent = other.Rent;
      }
      if (other.Name.Length != 0) {
        Name = other.Name;
      }
      if (other.pos_ != null) {
        if (pos_ == null) {
          Pos = new global::Monopoly.Protobuf.Coordinate();
        }
        Pos.MergeFrom(other.Pos);
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
          case 8: {
            CurrentLevel = input.ReadInt32();
            break;
          }
          case 16: {
            Cost = input.ReadInt32();
            break;
          }
          case 24: {
            Rent = input.ReadInt32();
            break;
          }
          case 34: {
            Name = input.ReadString();
            break;
          }
          case 42: {
            if (pos_ == null) {
              Pos = new global::Monopoly.Protobuf.Coordinate();
            }
            input.ReadMessage(Pos);
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
          case 8: {
            CurrentLevel = input.ReadInt32();
            break;
          }
          case 16: {
            Cost = input.ReadInt32();
            break;
          }
          case 24: {
            Rent = input.ReadInt32();
            break;
          }
          case 34: {
            Name = input.ReadString();
            break;
          }
          case 42: {
            if (pos_ == null) {
              Pos = new global::Monopoly.Protobuf.Coordinate();
            }
            input.ReadMessage(Pos);
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
