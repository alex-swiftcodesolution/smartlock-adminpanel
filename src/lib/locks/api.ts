import type { SmartLock } from "./types";

const getStatus = (device: any, code: string) =>
  (device.status ?? []).find((s: any) => s.code === code)?.value;

export const mapTuyaToLock = (device: any): SmartLock | undefined => {
  if (!device) return;
  const locked = getStatus(device, "lock_motor_state");
  const battery =
    getStatus(device, "residual_electricity") ??
    getStatus(device, "battery_percentage") ??
    getStatus(device, "battery_state") ??
    100;
  const door = getStatus(device, "door_contact_state");

  return {
    id: device.id,
    name: device.name,
    status:
      locked === true ? "locked" : locked === false ? "unlocked" : "jammed",
    battery:
      typeof battery === "number" ? battery : battery === "high" ? 90 : 20,
    door: door === true ? true : door === false ? false : undefined,
    isOnline: device.online,
    location: "Tuya Cloud",
    model: device.product_name,
    events: [],
  };
};

// REAL API CALLS
export const getLocks = async (): Promise<SmartLock[]> => {
  const res = await fetch("/api/tuya/devices", { cache: "no-store" });
  if (!res.ok) return [];
  const { devices } = await res.json();
  return devices.map(mapTuyaToLock).filter(Boolean) as SmartLock[];
};

export const getLockById = async (
  id: string
): Promise<SmartLock | undefined> => {
  const res = await fetch(`/api/tuya/devices/${id}`, { cache: "no-store" });
  if (!res.ok) return;
  const { device } = await res.json();
  return mapTuyaToLock(device);
};

export const fetchRecords = async (
  id: string,
  type: "unlock" | "alert" = "unlock"
) => {
  const res = await fetch(`/api/tuya/devices/${id}/records?type=${type}`);
  return res.ok ? (await res.json()).records : [];
};

export const fetchStatus = async (id: string) => {
  const res = await fetch(`/api/tuya/devices/${id}/status`);
  return res.ok ? await res.json() : { battery: 0 };
};

export const createTempPwd = async (id: string, name: string, pwd: string) => {
  const res = await fetch(`/api/tuya/devices/${id}/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password: pwd, type: "temp" }),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

export const remoteUnlock = async (id: string) => {
  const res = await fetch(`/api/tuya/devices/${id}/remote-unlock`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed");
};
