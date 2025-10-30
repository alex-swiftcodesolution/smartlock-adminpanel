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
  battery: number; // Percentage
  isOnline: boolean;
  location: string;
  model: string;
  events: LockEvent[];
};

export const dummyLocks: SmartLock[] = [
  {
    id: "SL-001",
    name: "Main Entrance",
    status: "locked",
    battery: 88,
    isOnline: true,
    location: "Lobby",
    model: "TuyaGuard Pro",
    events: [
      {
        id: "evt-1a",
        type: "locked",
        timestamp: "2023-10-27T10:00:00Z",
        user: "Admin",
        message: "Locked remotely by Admin.",
      },
      {
        id: "evt-1b",
        type: "unlocked",
        timestamp: "2023-10-27T09:30:00Z",
        user: "Jane Doe",
        message: "Unlocked with keycard.",
      },
    ],
  },
  {
    id: "SL-002",
    name: "Server Room",
    status: "locked",
    battery: 95,
    isOnline: true,
    location: "2nd Floor",
    model: "TuyaGuard Pro",
    events: [
      {
        id: "evt-2a",
        type: "locked",
        timestamp: "2023-10-27T11:00:00Z",
        user: "System",
        message: "Auto-locked.",
      },
    ],
  },
  {
    id: "SL-003",
    name: "CEO Office",
    status: "unlocked",
    battery: 21,
    isOnline: true,
    location: "5th Floor",
    model: "TuyaSecure Max",
    events: [
      {
        id: "evt-3a",
        type: "low_battery",
        timestamp: "2023-10-27T12:00:00Z",
        message: "Battery level is low (21%).",
      },
      {
        id: "evt-3b",
        type: "unlocked",
        timestamp: "2023-10-27T08:00:00Z",
        user: "John CEO",
        message: "Unlocked with fingerprint.",
      },
    ],
  },
  {
    id: "SL-004",
    name: "Warehouse Gate",
    status: "jammed",
    battery: 55,
    isOnline: false,
    location: "Loading Bay",
    model: "TuyaGuard Pro",
    events: [
      {
        id: "evt-4a",
        type: "jammed",
        timestamp: "2023-10-26T15:00:00Z",
        message: "Lock mechanism reported a jam.",
      },
    ],
  },
];

const mapTuyaDeviceToSmartLock = (device: any): SmartLock => {
  if (!device) return null as any;

  const getStatusValue = (code: string): any => {
    // Note: The details endpoint has `status` directly, the list endpoint has `status`
    const statusList = device.status || [];
    const status = statusList.find((s: any) => s.code === code);
    return status ? status.value : undefined;
  };

  // Confirm the 'code' for your lock in the Tuya IoT Platform (Device Debugging)
  const isLocked = getStatusValue("lock_motor_state");
  const batteryValue =
    getStatusValue("battery_percentage") ??
    getStatusValue("battery_state") ??
    100;

  return {
    id: device.id,
    name: device.name,
    status:
      isLocked === true ? "locked" : isLocked === false ? "unlocked" : "jammed",
    battery:
      typeof batteryValue === "number"
        ? batteryValue
        : batteryValue === "high"
        ? 90
        : 20,
    isOnline: device.online,
    location: "Tuya Cloud",
    model: device.product_name,
    // NOTE: Fetching real events requires another API call to /logs. We'll leave it empty.
    events: [],
  };
};

export const getLocks = async (): Promise<SmartLock[]> => {
  try {
    const res = await fetch("/api/tuya/devices", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success || !data.devices) return [];
    return data.devices.map(mapTuyaDeviceToSmartLock); // Use the mapping function
  } catch (error) {
    console.error("Error loading locks:", error);
    return [];
  }
};

export const getLockById = async (
  id: string
): Promise<SmartLock | undefined> => {
  try {
    const res = await fetch(`/api/tuya/devices/${id}`, { cache: "no-store" });
    if (!res.ok) return undefined;
    const data = await res.json();
    if (!data.success || !data.device) return undefined;
    return mapTuyaDeviceToSmartLock(data.device); // Use the same mapping function
  } catch (error) {
    console.error(`Error loading lock ${id}:`, error);
    return undefined;
  }
};
