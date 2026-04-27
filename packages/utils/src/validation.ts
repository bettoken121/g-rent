const IMEI_REGEX = /^\d{15}$/;

export function validateIMEI(imei: string): boolean {
  return IMEI_REGEX.test(imei);
}
