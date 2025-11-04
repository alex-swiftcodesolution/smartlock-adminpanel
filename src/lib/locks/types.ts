export type LockEvent = {
  id: string;
  type: "unlocked" | "locked" | "jammed" | "low_battery" | string;
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
  door?: boolean;
};
