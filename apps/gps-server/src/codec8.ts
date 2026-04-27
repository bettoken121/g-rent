/**
 * Teltonika Codec8 binary protocol parser.
 *
 * Packet structure:
 *   4 bytes: preamble (0x00000000)
 *   4 bytes: data field length
 *   1 byte:  codec ID (0x08)
 *   1 byte:  number of data records (Data 1)
 *   N records:
 *     8 bytes: timestamp (ms since epoch)
 *     1 byte:  priority
 *     4 bytes: longitude (signed int32, * 1e-7)
 *     4 bytes: latitude  (signed int32, * 1e-7)
 *     2 bytes: altitude
 *     2 bytes: angle
 *     1 byte:  satellites
 *     2 bytes: speed
 *     1 byte:  event IO ID
 *     1 byte:  number of total IO elements
 *     ... IO elements (variable length, skipped)
 *   1 byte:  number of data records (Data 2, must match Data 1)
 *   4 bytes: CRC-16
 */

export interface ParsedPosition {
  latitude: number;
  longitude: number;
  speed: number;
  altitude: number;
  angle: number;
  satellites: number;
  timestamp: Date;
}

export interface ParseResult {
  positions: ParsedPosition[];
  bytesConsumed: number;
}

export function parseCodec8(buffer: Buffer): ParseResult | null {
  if (buffer.length < 12) {
    return null;
  }

  // Check preamble
  const preamble = buffer.readUInt32BE(0);
  if (preamble !== 0x00000000) {
    throw new Error(`Invalid preamble: 0x${preamble.toString(16)}`);
  }

  const dataLength = buffer.readUInt32BE(4);
  const totalPacketLength = 8 + dataLength + 4; // preamble + length + data + CRC

  if (buffer.length < totalPacketLength) {
    return null; // Not enough data yet
  }

  const codecId = buffer.readUInt8(8);
  if (codecId !== 0x08) {
    throw new Error(`Unsupported codec: 0x${codecId.toString(16)}`);
  }

  const recordCount1 = buffer.readUInt8(9);
  const positions: ParsedPosition[] = [];
  let offset = 10;

  for (let i = 0; i < recordCount1; i++) {
    if (offset + 15 > buffer.length) {
      throw new Error('Truncated AVL record');
    }

    // Timestamp: 8 bytes (ms since 2000-01-01, but commonly ms since epoch)
    const timestampHigh = buffer.readUInt32BE(offset);
    const timestampLow = buffer.readUInt32BE(offset + 4);
    const timestampMs = timestampHigh * 0x100000000 + timestampLow;
    offset += 8;

    const priority = buffer.readUInt8(offset);
    offset += 1;

    // GPS coordinates
    const longitude = buffer.readInt32BE(offset) / 1e7;
    offset += 4;
    const latitude = buffer.readInt32BE(offset) / 1e7;
    offset += 4;
    const altitude = buffer.readUInt16BE(offset);
    offset += 2;
    const angle = buffer.readUInt16BE(offset);
    offset += 2;
    const satellites = buffer.readUInt8(offset);
    offset += 1;
    const speed = buffer.readUInt16BE(offset);
    offset += 2;

    // IO elements - skip them
    const eventIoId = buffer.readUInt8(offset);
    offset += 1;
    const totalIoCount = buffer.readUInt8(offset);
    offset += 1;

    // 1-byte IO elements
    if (offset < buffer.length) {
      const count1 = buffer.readUInt8(offset);
      offset += 1;
      offset += count1 * 2; // ID(1) + value(1)
    }

    // 2-byte IO elements
    if (offset < buffer.length) {
      const count2 = buffer.readUInt8(offset);
      offset += 1;
      offset += count2 * 3; // ID(1) + value(2)
    }

    // 4-byte IO elements
    if (offset < buffer.length) {
      const count4 = buffer.readUInt8(offset);
      offset += 1;
      offset += count4 * 5; // ID(1) + value(4)
    }

    // 8-byte IO elements
    if (offset < buffer.length) {
      const count8 = buffer.readUInt8(offset);
      offset += 1;
      offset += count8 * 9; // ID(1) + value(8)
    }

    positions.push({
      latitude,
      longitude,
      speed,
      altitude,
      angle,
      satellites,
      timestamp: new Date(timestampMs),
    });
  }

  return {
    positions,
    bytesConsumed: totalPacketLength,
  };
}
