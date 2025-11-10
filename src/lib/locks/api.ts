/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SmartLock } from "./types";
import { TuyaDevice } from "../tuya/types";

/* ---------- helpers ---------- */
const getStatus = (device: TuyaDevice, code: string) =>
  (device.status ?? []).find((s) => s.code === code)?.value;

/* ---------- mapping ---------- */
export const mapTuyaToLock = (
  device: TuyaDevice | null
): SmartLock | undefined => {
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

/* ---------- core lock API ---------- */
export const getLocks = async (): Promise<SmartLock[]> => {
  const res = await fetch("/api/tuya/devices", {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const { devices } = await res.json();
  return devices.map(mapTuyaToLock).filter(Boolean) as SmartLock[];
};

export const getLockById = async (
  id: string
): Promise<SmartLock | undefined> => {
  const res = await fetch(`/api/tuya/devices/${id}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!res.ok) return;
  const { device } = await res.json();
  return mapTuyaToLock(device);
};

export const fetchRecords = async (
  id: string,
  type: "unlock" | "alert" | "all" = "all",
  page = 1
) => {
  const res = await fetch(
    `/api/tuya/devices/${id}/records?type=${type}&page=${page}`,
    { next: { revalidate: 0 } }
  );
  return res.ok ? ((await res.json()).records as any[]) : [];
};

export const fetchStatus = async (id: string) => {
  const res = await fetch(`/api/tuya/devices/${id}/status`, {
    next: { revalidate: 0 },
  });
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

/* ---------- USER / MEMBER API ---------- */
export interface UsersPage {
  records: User[];
  total_pages: number;
}
export interface User {
  user_id: string;
  nick_name: string;
  user_type: 0 | 10 | 20 | 50;
  avatar_url?: string;
  user_contact?: string;
  lock_user_id?: number;
  back_home_notify_attr?: 0 | 1;
  effective_flag?: 0 | 1;
  time_schedule_info?: {
    permanent: boolean;
    effective_time?: number;
    expired_time?: number;
    schedule_details?: Array<{
      start_minute: number;
      end_minute: number;
      working_day: number;
      all_day: boolean;
      time_zone_id?: string;
    }>;
  };
  uid?: string;
  sex?: 1 | 2;
}

/* pagination */
export const fetchUsers = async (
  id: string,
  page: number,
  pageSize: number
): Promise<UsersPage> => {
  const res = await fetch(
    `/api/tuya/devices/${id}/users-enhanced?page=${page}&pageSize=${pageSize}`
  );
  return res.ok
    ? ((await res.json()) as UsersPage)
    : { records: [], total_pages: 1 };
};

export const fetchUser = async (id: string, userId: string): Promise<User> => {
  const res = await fetch(`/api/tuya/devices/${id}/users-enhanced/${userId}`);
  const data = await res.json();
  return data.user as User;
};

export const addUser = async (
  id: string,
  data: { nick_name: string; sex?: 1 | 2; contact?: string }
) =>
  fetch(`/api/tuya/devices/${id}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateUser = async (
  id: string,
  userId: string,
  data: { nick_name?: string; contact?: string }
) =>
  fetch(`/api/tuya/devices/${id}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteUser = async (id: string, userId: string) =>
  fetch(`/api/tuya/devices/${id}/users`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

export const batchDeleteUsers = async (id: string, userIds: string) =>
  fetch(`/api/tuya/devices/${id}/users/actions/batch-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_ids: userIds.split(",") }),
  });

export const updateUserRole = async (
  id: string,
  userId: string,
  role: "admin" | "normal"
) =>
  fetch(`/api/tuya/devices/${id}/users/${userId}/actions/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }), // Sends "admin" or "normal"
  });

/* ---------- SCHEDULE ---------- */
export const updateUserSchedule = async (
  id: string,
  userId: string,
  data: {
    permanent: boolean;
    effective_time?: number | null;
    expired_time?: number | null;
    schedule_details?: Array<{
      start_minute: number;
      end_minute: number;
      working_day: number;
      all_day: boolean;
      time_zone_id?: string;
    }>;
  }
) =>
  fetch(`/api/tuya/devices/${id}/users/${userId}/schedule`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

/* ---------- OP‑MODES ---------- */
export interface OpMode {
  unlock_name: string;
  dp_code: string;
  unlock_sn: number;
  unlock_attr: number;
  allocate_flag: 0 | 1;
}
export interface OpModesPage {
  records: OpMode[];
  total_pages: number;
}

export const fetchOpmodes = async (
  id: string,
  userId: string,
  page: number,
  pageSize: number
): Promise<OpModesPage> => {
  const res = await fetch(
    `/api/tuya/devices/${id}/opmodes/${userId}?page=${page}&pageSize=${pageSize}`
  );
  return res.ok
    ? ((await res.json()) as OpModesPage)
    : { records: [], total_pages: 1 };
};

export const cancelAllocateOpmodes = async (
  id: string,
  payload: {
    user_id: string;
    unlock_list: Array<{ code: string; unlock_sn: number }>;
  }
) =>
  fetch(`/api/tuya/devices/${id}/opmodes/actions/cancel-allocate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const remoteUnlock = async (id: string) => {
  const res = await fetch(`/api/tuya/devices/${id}/remote-unlock`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed");
};
