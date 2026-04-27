import axios from 'axios';

interface ForwardData {
  imei: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export async function forwardToApi(
  apiUrl: string,
  data: ForwardData,
  retries = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await axios.post(`${apiUrl}/gps/ingest`, data, {
        timeout: 5000,
      });
      console.log(
        `[GPS] Forwarded position for IMEI ${data.imei} to API (attempt ${attempt})`,
      );
      return;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[GPS] Forward failed (attempt ${attempt}/${retries}): ${message}`,
      );
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }
  console.error(`[GPS] Failed to forward data for IMEI ${data.imei} after ${retries} attempts`);
}
