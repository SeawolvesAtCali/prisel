export type BufferOffset = number;

import * as flatbuffers from 'flatbuffers';
import { Packet } from './packet';

export type BufferBuilder = (builder: flatbuffers.Builder) => BufferOffset;

export type PacketView<T extends Packet = Packet> = [Uint8Array, T];
