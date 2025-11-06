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

/**
 * Type guard for SmartLock
 */
export const isSmartLock = (obj: unknown): obj is SmartLock => {
  const candidate = obj as Partial<SmartLock>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    ["locked", "unlocked", "jammed"].includes(candidate.status ?? "") &&
    typeof candidate.battery === "number" &&
    typeof candidate.isOnline === "boolean"
  );
};
