/**
 * GPS Simulator - sends simulated GPS data via HTTP to the API
 * and also simulates Teltonika Codec8 TCP packets.
 *
 * Usage: npx ts-node src/simulator.ts [mode]
 *   mode: "http" (default) or "tcp"
 */

import axios from 'axios';
import * as net from 'net';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const GPS_HOST = process.env.GPS_HOST || 'localhost';
const GPS_PORT = parseInt(process.env.GPS_PORT || '5000', 10);

const VEHICLES = [
  { imei: '356789012340001', lat: 48.8566, lng: 2.3522, name: 'Toyota Corolla' },
  { imei: '356789012340002', lat: 48.8606, lng: 2.3376, name: 'BMW 3 Series' },
  { imei: '356789012340003', lat: 48.8530, lng: 2.3499, name: 'Mercedes C-Class' },
  { imei: '356789012340004', lat: 48.8650, lng: 2.3250, name: 'Audi A4' },
];

function randomDelta(): number {
  return (Math.random() - 0.5) * 0.002;
}

async function simulateHttp() {
  console.log(`[Simulator] Sending GPS data via HTTP to ${API_URL}`);
  let iteration = 0;

  const interval = setInterval(async () => {
    iteration++;
    for (const vehicle of VEHICLES) {
      vehicle.lat += randomDelta();
      vehicle.lng += randomDelta();
      const speed = Math.floor(Math.random() * 80);

      try {
        await axios.post(`${API_URL}/gps/ingest`, {
          imei: vehicle.imei,
          latitude: vehicle.lat,
          longitude: vehicle.lng,
          speed,
          timestamp: new Date().toISOString(),
        });
        console.log(
          `[Simulator] #${iteration} ${vehicle.name}: lat=${vehicle.lat.toFixed(6)} lng=${vehicle.lng.toFixed(6)} speed=${speed}`,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Simulator] Error sending data for ${vehicle.name}: ${message}`);
      }
    }
  }, 3000);

  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('[Simulator] Stopped');
    process.exit(0);
  });
}

function buildCodec8Packet(lat: number, lng: number, speed: number): Buffer {
  const timestamp = BigInt(Date.now());

  // AVL data record (no IO elements)
  const record = Buffer.alloc(30);
  let offset = 0;

  // Timestamp (8 bytes)
  record.writeUInt32BE(Number(timestamp >> 32n), offset);
  offset += 4;
  record.writeUInt32BE(Number(timestamp & 0xFFFFFFFFn), offset);
  offset += 4;

  // Priority
  record.writeUInt8(0, offset);
  offset += 1;

  // Longitude (int32, * 1e7)
  record.writeInt32BE(Math.round(lng * 1e7), offset);
  offset += 4;

  // Latitude (int32, * 1e7)
  record.writeInt32BE(Math.round(lat * 1e7), offset);
  offset += 4;

  // Altitude
  record.writeUInt16BE(100, offset);
  offset += 2;

  // Angle
  record.writeUInt16BE(0, offset);
  offset += 2;

  // Satellites
  record.writeUInt8(10, offset);
  offset += 1;

  // Speed
  record.writeUInt16BE(speed, offset);
  offset += 2;

  // Event IO ID
  record.writeUInt8(0, offset);
  offset += 1;

  // Total IO elements count
  record.writeUInt8(0, offset);
  offset += 1;

  // Build full packet
  const codecId = 0x08;
  const recordCount = 1;
  const dataFieldLength = 1 + 1 + record.length + 1; // codec + count1 + record + count2

  const packet = Buffer.alloc(8 + dataFieldLength + 4);
  let pOffset = 0;

  // Preamble
  packet.writeUInt32BE(0x00000000, pOffset);
  pOffset += 4;

  // Data field length
  packet.writeUInt32BE(dataFieldLength, pOffset);
  pOffset += 4;

  // Codec ID
  packet.writeUInt8(codecId, pOffset);
  pOffset += 1;

  // Record count 1
  packet.writeUInt8(recordCount, pOffset);
  pOffset += 1;

  // Copy record
  record.copy(packet, pOffset);
  pOffset += record.length;

  // Record count 2
  packet.writeUInt8(recordCount, pOffset);
  pOffset += 1;

  // CRC (simplified - zeros)
  packet.writeUInt32BE(0, pOffset);

  return packet;
}

function simulateTcp(vehicle: typeof VEHICLES[0]) {
  const client = new net.Socket();

  client.connect(GPS_PORT, GPS_HOST, () => {
    console.log(`[TCP Simulator] Connected for ${vehicle.name} (IMEI: ${vehicle.imei})`);

    // Send IMEI
    const imeiBuffer = Buffer.alloc(2 + vehicle.imei.length);
    imeiBuffer.writeUInt16BE(vehicle.imei.length, 0);
    imeiBuffer.write(vehicle.imei, 2, 'ascii');
    client.write(imeiBuffer);
  });

  let authenticated = false;

  client.on('data', (data) => {
    if (!authenticated) {
      const accepted = data.readUInt8(0);
      if (accepted === 1) {
        console.log(`[TCP Simulator] ${vehicle.name} authenticated`);
        authenticated = true;

        // Start sending position data
        const interval = setInterval(() => {
          vehicle.lat += randomDelta();
          vehicle.lng += randomDelta();
          const speed = Math.floor(Math.random() * 80);

          const packet = buildCodec8Packet(vehicle.lat, vehicle.lng, speed);
          client.write(packet);
          console.log(
            `[TCP Simulator] ${vehicle.name}: lat=${vehicle.lat.toFixed(6)} lng=${vehicle.lng.toFixed(6)} speed=${speed}`,
          );
        }, 5000);

        client.on('close', () => clearInterval(interval));
      } else {
        console.log(`[TCP Simulator] ${vehicle.name} rejected`);
        client.destroy();
      }
    } else {
      // ACK received
      const ackCount = data.readUInt32BE(0);
      console.log(`[TCP Simulator] ${vehicle.name}: ACK for ${ackCount} records`);
    }
  });

  client.on('error', (err) => {
    console.error(`[TCP Simulator] ${vehicle.name} error:`, err.message);
  });

  client.on('close', () => {
    console.log(`[TCP Simulator] ${vehicle.name} disconnected`);
  });
}

const mode = process.argv[2] || 'http';

if (mode === 'tcp') {
  console.log(`[Simulator] Starting TCP simulation to ${GPS_HOST}:${GPS_PORT}`);
  for (const vehicle of VEHICLES) {
    simulateTcp(vehicle);
  }
} else {
  simulateHttp();
}
