import { tuyaFetch } from "./client";
import { TuyaDevice } from "./types";

const APP_UID = process.env.TUYA_APP_ACCOUNT_UID!;
if (!APP_UID) throw new Error("Missing TUYA_APP_ACCOUNT_UID");

export const listDevices = async (): Promise<TuyaDevice[]> =>
  tuyaFetch<TuyaDevice[]>("GET", `/v1.0/users/${APP_UID}/devices`);

export const getDevice = async (id: string) =>
  tuyaFetch<TuyaDevice>("GET", `/v1.0/devices/${id}`);
