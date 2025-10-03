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

// Helper function to simulate fetching data
export const getLocks = async (): Promise<SmartLock[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(dummyLocks), 500));
};

export const getLockById = async (
  id: string
): Promise<SmartLock | undefined> => {
  return new Promise((resolve) =>
    setTimeout(() => resolve(dummyLocks.find((lock) => lock.id === id)), 500)
  );
};
