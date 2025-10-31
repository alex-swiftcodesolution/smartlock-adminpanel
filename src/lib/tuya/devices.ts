import { tuyaFetch } from "./client";
import { TuyaDevice } from "./types";

const APP_UID = process.env.TUYA_APP_ACCOUNT_UID!;
if (!APP_UID) throw new Error("Missing TUYA_APP_ACCOUNT_UID");

export const listDevices = async (): Promise<TuyaDevice[]> => {
  console.log(`Fetching device list for user ${APP_UID}`);
  const devices = await tuyaFetch<TuyaDevice[]>(
    "GET",
    `/v1.0/users/${APP_UID}/devices`
  );
  console.log(`Fetched ${devices.length} devices`);
  return devices;
};

export const getDevice = async (id: string) => {
  console.log(`Fetching device ${id}`);
  const device = await tuyaFetch<TuyaDevice>("GET", `/v1.0/devices/${id}`);
  console.log(`Fetched device ${id}:`, device);
  return device;
};
