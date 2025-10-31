/* eslint-disable @typescript-eslint/no-explicit-any */
export type LockEvent = {
  id: string;
  type: "unlocked" | "locked" | "jammed" | "low_battery";
  timestamp: string;
  user?: string;
  message: string;
};

export type SmartLock = {
  id: string;
  name: string;
  status: "locked" | "unlocked" | "jammed";
  battery: number;
  isOnline: boolean;
  location: string;
  model: string;
  events: LockEvent[];
};

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

  return {
    id: device.id,
    name: device.name,
    status:
      locked === true ? "locked" : locked === false ? "unlocked" : "jammed",
    battery:
      typeof battery === "number" ? battery : battery === "high" ? 90 : 20,
    isOnline: device.online,
    location: "Tuya Cloud",
    model: device.product_name,
    events: [],
  };
};

export const getLocks = async (): Promise<SmartLock[]> => {
  try {
    const res = await fetch("/api/tuya/devices", { cache: "no-store" });
    if (!res.ok) return [];
    const { devices } = await res.json();
    return devices.map(mapTuyaToLock).filter(Boolean) as SmartLock[];
  } catch {
    return [];
  }
};

export const getLockById = async (
  id: string
): Promise<SmartLock | undefined> => {
  try {
    const res = await fetch(`/api/tuya/devices/${id}`, { cache: "no-store" });
    if (!res.ok) return;
    const { device } = await res.json();
    return mapTuyaToLock(device);
  } catch {
    return;
  }
};
