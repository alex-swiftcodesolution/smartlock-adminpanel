import { tuyaFetch } from "./client";

// ── Lock Commands ─────────────────────────────────
export const unlockDevice = async (deviceId: string) => {
  console.log(`Unlocking device ${deviceId}`);
  const { ticket_id } = await tuyaFetch<{ ticket_id: string }>(
    "POST",
    `/v1.0/devices/${deviceId}/door-lock/password-ticket`,
    {}
  );
  console.log(`Got ticket: ${ticket_id}`);
  const result = await tuyaFetch<unknown>(
    "POST",
    `/v1.0/smart-lock/devices/${deviceId}/password-free/door-operate`,
    { ticket_id, open: true }
  );
  console.log(`Unlock result:`, result);
  return result;
};

export const lockDevice = async (deviceId: string) => {
  console.log(`Locking via DP: ${deviceId}`);
  const result = await tuyaFetch<unknown>(
    "POST",
    `/v1.0/devices/${deviceId}/commands`,
    {
      commands: [{ code: "lock_motor_state", value: true }],
    }
  );
  console.log("Lock command result:", result);
  return result;
};

// ── Passwords ─────────────────────────────────────
export const createPassword = (
  id: string,
  data: {
    name: string;
    password: string;
    type: "temp" | "one_time" | "dynamic";
    start?: number;
    end?: number;
  }
) =>
  tuyaFetch<unknown>("POST", `/v1.0/smart-lock/devices/${id}/passwords`, {
    password_type: data.type,
    name: data.name,
    password: data.password,
    effective_time: data.start,
    invalid_time: data.end,
  });

export const deletePassword = (id: string, pwdId: string) =>
  tuyaFetch<unknown>(
    "DELETE",
    `/v1.0/smart-lock/devices/${id}/passwords/${pwdId}`
  );

export const freezePassword = (id: string, pwdId: string, freeze: boolean) =>
  tuyaFetch<unknown>(
    "PUT",
    `/v1.0/smart-lock/devices/${id}/passwords/${pwdId}/freeze`,
    {
      freeze,
    }
  );

export const clearOfflinePwd = (id: string) =>
  tuyaFetch<unknown>(
    "POST",
    `/v1.0/smart-lock/devices/${id}/passwords/offline/clear`
  );

// ── Remote Unlock ─────────────────────────────────
export const requestRemoteUnlock = async (id: string) =>
  tuyaFetch<unknown>(
    "POST",
    `/v1.0/smart-lock/devices/${id}/password-free/door-operate`,
    {
      ticket_id: (
        await tuyaFetch<{ ticket_id: string }>(
          "POST",
          `/v1.0/devices/${id}/door-lock/password-ticket`,
          {}
        )
      ).ticket_id,
      open: true,
    }
  );

// ── Records ───────────────────────────────────────
export const getRecords = async (
  deviceId: string,
  type: "unlock" | "alert" | "all" = "all",
  page = 1,
  pageSize = 50
) => {
  let base = `/v1.0/devices/${deviceId}/door-lock/open-logs`;
  if (type === "alert") {
    base = `/v1.0/devices/${deviceId}/door-lock/alarm-logs`;
  }

  const query = new URLSearchParams({
    page_no: String(page),
    page_size: String(pageSize),
    start_time: String(Math.floor(Date.now() / 1000) - 30 * 24 * 3600),
    end_time: String(Math.floor(Date.now() / 1000)),
  });

  if (type === "alert") {
    query.set("codes", "hijack,alarm_lock,doorbell");
  }

  const fullPath = `${base}?${query.toString()}`;
  return await tuyaFetch<{
    total: number;
    logs?: unknown[];
    records?: unknown[];
  }>("GET", fullPath);
};

// ── Doorbell ──────────────────────────────────────
export const getDoorbellEvents = (id: string, page = 1) =>
  tuyaFetch<unknown>("GET", `/v1.0/smart-lock/devices/${id}/doorbell/events`, {
    page_no: page,
    page_size: 20,
  });

// ── Members ───────────────────────────────────────
export const listMembers = (id: string) =>
  tuyaFetch<unknown>("GET", `/v1.0/smart-lock/devices/${id}/members`);

export const addMember = (id: string, mobile: string, name: string) =>
  tuyaFetch<unknown>("POST", `/v1.0/smart-lock/devices/${id}/members`, {
    mobile,
    name,
  });

export const removeMember = (id: string, memberId: string) =>
  tuyaFetch<unknown>(
    "DELETE",
    `/v1.0/smart-lock/devices/${id}/members/${memberId}`
  );

// ── Status ────────────────────────────────────────
export const getFullStatus = (id: string) =>
  tuyaFetch<unknown>("GET", `/v1.0/devices/${id}/status`);

// ── Basic User Management ─────────────────────────────────
export const addUser = async (
  deviceId: string,
  data: {
    nick_name: string;
    sex: 1 | 2;
    birthday?: number;
    height?: number;
    weight?: number;
    contact?: string;
  }
) => {
  return await tuyaFetch<{ user_id: string }>(
    "POST",
    `/v1.0/devices/${deviceId}/user`,
    data
  );
};

export const listUsers = async (deviceId: string) => {
  return await tuyaFetch<{
    users: Array<{
      user_id: string;
      nick_name: string;
      sex: 1 | 2;
      birthday?: number;
      height?: number;
      weight?: number;
      contact?: string;
    }>;
  }>("GET", `/v1.0/devices/${deviceId}/users`);
};

export const updateUser = async (
  deviceId: string,
  userId: string,
  data: {
    nick_name?: string;
    sex: 1 | 2;
    birthday?: number;
    height?: number;
    weight?: number;
    contact?: string;
  }
) => {
  return await tuyaFetch<boolean>(
    "PUT",
    `/v1.0/devices/${deviceId}/users/${userId}`,
    data
  );
};

export const deleteUser = async (deviceId: string, userId: string) => {
  return await tuyaFetch<boolean>(
    "DELETE",
    `/v1.0/devices/${deviceId}/users/${userId}`
  );
};

export const getUser = async (deviceId: string, userId: string) => {
  return await tuyaFetch<{
    user_id: string;
    device_id: string;
    nick_name: string;
    sex: 1 | 2;
    birthday?: number;
    height?: number;
    weight?: number;
    contact?: string;
  }>("GET", `/v1.0/devices/${deviceId}/users/${userId}`);
};

// ── Enhanced User Management (v1.1) ───────────────────────
export const listUsersEnhanced = async (
  deviceId: string,
  params: {
    keyword?: string;
    role?: "admin" | "normal";
    page_no: number;
    page_size: number;
  }
) => {
  const query = new URLSearchParams({
    keyword: params.keyword || "",
    role: params.role || "",
    page_no: params.page_no.toString(),
    page_size: params.page_size.toString(),
  });
  return await tuyaFetch<{
    has_more: boolean;
    total_pages: number;
    total: number;
    records: Array<{
      user_id: string;
      avatar_url?: string;
      user_contact?: string;
      user_type: 0 | 10 | 20 | 50;
      nick_name: string;
      lock_user_id: number;
      back_home_notify_attr: 0 | 1;
      effective_flag: 0 | 1;
      time_schedule_info: {
        permanent: boolean;
        effective_time?: number;
        expired_time?: number;
        operate?: "ADD" | "MODIFY" | "DELETE";
        delivery_status?: "ONGOING" | "SUCCESS" | "FAILED";
        schedule_details?: Array<{
          working_day: number;
          all_day: boolean;
          start_minute: number;
          end_minute: number;
          time_zone_id?: string;
        }>;
      };
      uid: string;
    }>;
  }>("GET", `/v1.1/devices/${deviceId}/users?${query.toString()}`);
};

export const getUserEnhanced = async (
  deviceId: string,
  userId: string | "0"
) => {
  return await tuyaFetch<{
    user_id: string;
    avatar_url?: string;
    user_contact?: string;
    unlock_detail?: Array<{
      dp_code: string;
      unlock_list: Array<{
        dp_code: string;
        unlock_sn: number;
        unlock_name: string;
        unlock_attr: 0 | 1;
        allocate_flag: 0 | 1;
      }>;
      num: number;
    }>;
    user_type: 10 | 20 | 50;
    nick_name: string;
    lock_user_id: number;
    back_home_notify_attr: 0 | 1;
    effective_flag: 0 | 1;
    time_schedule_info: {
      permanent: boolean;
      effective_time?: number;
      expired_time?: number;
      operate?: "ADD" | "MODIFY" | "DELETE";
      delivery_status?: "ONGOING" | "SUCCESS" | "FAILED";
      schedule_details?: {
        start_minute: number;
        end_minute: number;
        working_day: number;
        all_day: boolean;
        time_zone_id?: string;
      };
    };
    uid: string;
  }>("GET", `/v1.1/devices/${deviceId}/users/${userId}`);
};

// ── Smart Lock User Management ───────────────────────────
export const listSmartLockUsers = async (
  deviceId: string,
  params: { codes: string; page_no: number; page_size: number }
) => {
  const query = new URLSearchParams({
    codes: params.codes,
    page_no: params.page_no.toString(),
    page_size: params.page_size.toString(),
  });
  return await tuyaFetch<{
    total: number;
    total_pages: number;
    has_more: boolean;
    records: Array<{
      user_id: string;
      avatar_url?: string;
      user_contact?: string;
      unlock_detail: Array<{
        dp_code: string;
        unlock_list: Array<{
          unlock_id: string;
          unlock_sn: number;
          unlock_name: string;
          unlock_attr: number;
          op_mode_id: number;
          photo_unlock: boolean;
          admin: boolean;
        }>;
        count: number;
      }>;
      user_type: 10 | 20 | 50;
      nick_name: string;
      lock_user_id: number;
      back_home_notify_attr: 0 | 1;
      effective_flag: 0 | 1;
      time_schedule_info: {
        permanent: boolean;
        effective_time?: number;
        expired_time?: number;
        operate?: "ADD" | "MODIFY" | "DELETE";
        delivery_status?: "ONGOING" | "SUCCESS" | "FAILED";
        schedule_details?: Array<{
          start_minute: number;
          end_minute: number;
          working_day: number;
          time_zone_id?: string;
          all_day: boolean;
        }>;
      };
      uid: string;
    }>;
  }>("GET", `/v1.0/smart-lock/devices/${deviceId}/users?${query.toString()}`);
};

export const updateUserSchedule = async (
  deviceId: string,
  userId: string,
  data: {
    permanent?: boolean;
    effective_time?: number;
    expired_time?: number;
    schedule_details?: Array<{
      start_minute: number;
      end_minute: number;
      working_day: number;
      time_zone_id?: string;
      all_day?: boolean;
    }>;
  }
) => {
  return await tuyaFetch<boolean>(
    "PUT",
    `/v1.0/smart-lock/devices/${deviceId}/users/${userId}/schedule`,
    data
  );
};

export const batchDeleteUsers = async (deviceId: string, userIds: string) => {
  // userIds comma-separated
  return await tuyaFetch<boolean>(
    "POST",
    `/v1.0/smart-lock/devices/${deviceId}/users/${userIds}/actions/delete-users-issue`
  );
};

export const updateUserRole = async (
  deviceId: string,
  userId: string,
  role: "admin" | "normal"
) => {
  return await tuyaFetch<void>(
    "PUT",
    `/v1.0/smart-lock/devices/${deviceId}/users/${userId}/actions/role`,
    { role }
  );
};

// ── Opmodes (Unlock Methods) ──────────────────────────────
export const getUserOpmodes = async (
  deviceId: string,
  userId: string,
  params: {
    codes?: string;
    unlock_name?: string;
    page_no: number;
    page_size: number;
  }
) => {
  const query = new URLSearchParams({
    codes: params.codes || "",
    unlock_name: params.unlock_name || "",
    page_no: params.page_no.toString(),
    page_size: params.page_size.toString(),
  });
  return await tuyaFetch<{
    total: number;
    total_pages: number;
    has_more: boolean;
    records: Array<{
      user_name: string;
      user_type: 0 | 10 | 20 | 40 | 50;
      user_id: string;
      lock_user_id: number;
      unlock_name: string;
      dp_code: string;
      unlock_sn: number;
      unlock_attr: number;
      phase: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
      notify_info?: {
        app_send: boolean;
        voice_phone?: string;
        owner_id?: string;
      };
      voice_attr: 0 | 1;
      operate?: "CREATE" | "MODIFY" | "DELETE";
      delivery_status?: "ONGOING" | "SUCCESS" | "FAILED";
      allocate_flag: 0 | 1;
      channel_id: number;
    }>;
  }>(
    "GET",
    `/v1.0/smart-lock/devices/${deviceId}/opmodes/${userId}?${query.toString()}`
  );
};

export const cancelAllocateOpmodes = async (
  deviceId: string,
  data: {
    user_id: string;
    unlock_list: Array<{ code: string; unlock_sn: number }>;
  }
) => {
  return await tuyaFetch<boolean>(
    "POST",
    `/v1.0/smart-lock/devices/${deviceId}/opmodes/actions/cancel-allocate`,
    data
  );
};
