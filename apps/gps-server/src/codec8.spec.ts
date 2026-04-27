import { parseCodec8 } from './codec8';

describe('Codec8 Parser', () => {
  it('should return null for buffer too small', () => {
    const buf = Buffer.alloc(5);
    expect(parseCodec8(buf)).toBeNull();
  });

  it('should throw on invalid preamble', () => {
    const buf = Buffer.alloc(12);
    buf.writeUInt32BE(0x01010101, 0);
    expect(() => parseCodec8(buf)).toThrow('Invalid preamble');
  });

  it('should throw on unsupported codec', () => {
    const buf = Buffer.alloc(20);
    buf.writeUInt32BE(0x00000000, 0); // preamble
    buf.writeUInt32BE(5, 4); // data length
    buf.writeUInt8(0x09, 8); // wrong codec
    expect(() => parseCodec8(buf)).toThrow('Unsupported codec');
  });

  it('should return null if not enough data for full packet', () => {
    const buf = Buffer.alloc(12);
    buf.writeUInt32BE(0x00000000, 0); // preamble
    buf.writeUInt32BE(100, 4); // data length larger than buffer
    expect(parseCodec8(buf)).toBeNull();
  });

  it('should parse a valid single-record Codec8 packet', () => {
    // Build a minimal valid packet with 1 record and 0 IO elements
    const recordSize = 30; // 8+1+4+4+2+2+1+2+1+1 + 4 padding for IO counts
    const dataFieldLength = 1 + 1 + recordSize + 1;
    const totalLength = 8 + dataFieldLength + 4;
    const buf = Buffer.alloc(totalLength);
    let offset = 0;

    // Preamble
    buf.writeUInt32BE(0x00000000, offset); offset += 4;
    // Data field length
    buf.writeUInt32BE(dataFieldLength, offset); offset += 4;
    // Codec ID
    buf.writeUInt8(0x08, offset); offset += 1;
    // Record count 1
    buf.writeUInt8(1, offset); offset += 1;

    // Timestamp
    const now = Date.now();
    buf.writeUInt32BE(Math.floor(now / 0x100000000), offset); offset += 4;
    buf.writeUInt32BE(now % 0x100000000, offset); offset += 4;

    // Priority
    buf.writeUInt8(0, offset); offset += 1;

    // Longitude (2.3522 * 1e7)
    buf.writeInt32BE(Math.round(2.3522 * 1e7), offset); offset += 4;
    // Latitude (48.8566 * 1e7)
    buf.writeInt32BE(Math.round(48.8566 * 1e7), offset); offset += 4;

    // Altitude
    buf.writeUInt16BE(100, offset); offset += 2;
    // Angle
    buf.writeUInt16BE(180, offset); offset += 2;
    // Satellites
    buf.writeUInt8(12, offset); offset += 1;
    // Speed
    buf.writeUInt16BE(60, offset); offset += 2;

    // Event IO ID
    buf.writeUInt8(0, offset); offset += 1;
    // Total IO count
    buf.writeUInt8(0, offset); offset += 1;

    // Record count 2
    buf.writeUInt8(1, offset); offset += 1;
    // CRC
    buf.writeUInt32BE(0, offset);

    const result = parseCodec8(buf);
    expect(result).not.toBeNull();
    expect(result!.positions).toHaveLength(1);

    const pos = result!.positions[0];
    expect(pos.latitude).toBeCloseTo(48.8566, 3);
    expect(pos.longitude).toBeCloseTo(2.3522, 3);
    expect(pos.speed).toBe(60);
    expect(pos.altitude).toBe(100);
    expect(pos.satellites).toBe(12);
    expect(result!.bytesConsumed).toBe(totalLength);
  });
});
