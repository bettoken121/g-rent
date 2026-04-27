import * as net from 'net';
import * as dotenv from 'dotenv';
import { parseCodec8 } from './codec8';
import { forwardToApi } from './forwarder';
import { validateIMEI } from '@g-rent/utils';

dotenv.config();

const PORT = parseInt(process.env.GPS_PORT || '5000', 10);
const API_URL = process.env.API_URL || 'http://localhost:4000';

const IMEI_WHITELIST = new Set(
  (process.env.IMEI_WHITELIST || '').split(',').filter(Boolean),
);
const ALLOW_ALL_IMEI = process.env.ALLOW_ALL_IMEI === 'true' || IMEI_WHITELIST.size === 0;

interface ConnectionState {
  imei: string | null;
  authenticated: boolean;
  buffer: Buffer;
}

const server = net.createServer((socket) => {
  const remoteAddr = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[GPS] New connection from ${remoteAddr}`);

  const state: ConnectionState = {
    imei: null,
    authenticated: false,
    buffer: Buffer.alloc(0),
  };

  socket.on('data', async (data) => {
    try {
      console.log(`[GPS] Raw data from ${remoteAddr}: ${data.toString('hex')}`);
      state.buffer = Buffer.concat([state.buffer, data]);

      if (!state.authenticated) {
        // IMEI authentication phase
        // Teltonika sends: 2 bytes (IMEI length) + IMEI string
        if (state.buffer.length < 2) return;

        const imeiLength = state.buffer.readUInt16BE(0);
        if (state.buffer.length < 2 + imeiLength) return;

        const imei = state.buffer.subarray(2, 2 + imeiLength).toString('ascii');
        state.buffer = state.buffer.subarray(2 + imeiLength);

        console.log(`[GPS] IMEI received: ${imei}`);

        if (!validateIMEI(imei)) {
          console.log(`[GPS] Invalid IMEI format: ${imei}`);
          const response = Buffer.alloc(1);
          response.writeUInt8(0, 0); // Reject
          socket.write(response);
          socket.destroy();
          return;
        }

        if (!ALLOW_ALL_IMEI && !IMEI_WHITELIST.has(imei)) {
          console.log(`[GPS] IMEI not whitelisted: ${imei}`);
          const response = Buffer.alloc(1);
          response.writeUInt8(0, 0); // Reject
          socket.write(response);
          socket.destroy();
          return;
        }

        state.imei = imei;
        state.authenticated = true;

        // Accept the connection
        const response = Buffer.alloc(1);
        response.writeUInt8(1, 0); // Accept
        socket.write(response);
        console.log(`[GPS] IMEI ${imei} accepted`);
        return;
      }

      // Data phase - parse Codec8 packets
      if (state.buffer.length < 12) return; // Minimum packet size

      try {
        const result = parseCodec8(state.buffer);
        if (result) {
          const { positions, bytesConsumed } = result;
          state.buffer = state.buffer.subarray(bytesConsumed);

          console.log(
            `[GPS] Parsed ${positions.length} positions from IMEI ${state.imei}`,
          );

          // Send ACK with number of data records
          const ack = Buffer.alloc(4);
          ack.writeUInt32BE(positions.length, 0);
          socket.write(ack);

          // Forward to API
          for (const pos of positions) {
            await forwardToApi(API_URL, {
              imei: state.imei!,
              latitude: pos.latitude,
              longitude: pos.longitude,
              speed: pos.speed,
              timestamp: pos.timestamp.toISOString(),
            });
          }
        }
      } catch (parseErr) {
        console.error(`[GPS] Parse error for IMEI ${state.imei}:`, parseErr);
        // Do NOT crash - just log and continue
      }
    } catch (err) {
      console.error(`[GPS] Error handling data from ${remoteAddr}:`, err);
      // Do NOT crash the server
    }
  });

  socket.on('error', (err) => {
    console.error(`[GPS] Socket error from ${remoteAddr}:`, err.message);
  });

  socket.on('close', () => {
    console.log(`[GPS] Connection closed: ${remoteAddr} (IMEI: ${state.imei || 'unknown'})`);
  });
});

server.on('error', (err) => {
  console.error('[GPS] Server error:', err);
});

server.listen(PORT, () => {
  console.log(`[GPS] TCP server listening on port ${PORT}`);
  console.log(`[GPS] API URL: ${API_URL}`);
  console.log(`[GPS] IMEI whitelist: ${ALLOW_ALL_IMEI ? 'ALLOW ALL' : Array.from(IMEI_WHITELIST).join(', ')}`);
});
