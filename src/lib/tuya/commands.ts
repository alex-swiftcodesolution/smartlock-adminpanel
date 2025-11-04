import { tuyaFetch } from "./client";

export const unlockDevice = async (deviceId: string) => {
  console.log(`Unlocking device ${deviceId}`);
  const { ticket_id } = await tuyaFetch<{ ticket_id: string }>(
    "POST",
    `/v1.0/devices/${deviceId}/door-lock/password-ticket`,
    {}
  );
  console.log(`Got ticket: ${ticket_id}`);
  const result = await tuyaFetch(
    "POST",
    `/v1.0/smart-lock/devices/${deviceId}/password-free/door-operate`,
    { ticket_id, open: true }
  );
  console.log(`Unlock result:`, result);
  return result;
};

export const lockDevice = async (deviceId: string) => {
  console.log(`Locking via DP: ${deviceId}`);
  const result = await tuyaFetch("POST", `/v1.0/devices/${deviceId}/commands`, {
    commands: [{ code: "lock_motor_state", value: true }],
  });
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
  tuyaFetch("POST", `/v1.0/smart-lock/devices/${id}/passwords`, {
    password_type: data.type,
    name: data.name,
    password: data.password,
    effective_time: data.start,
    invalid_time: data.end,
  });

export const deletePassword = (id: string, pwdId: string) =>
  tuyaFetch("DELETE", `/v1.0/smart-lock/devices/${id}/passwords/${pwdId}`);

export const freezePassword = (id: string, pwdId: string, freeze: boolean) =>
  tuyaFetch("PUT", `/v1.0/smart-lock/devices/${id}/passwords/${pwdId}/freeze`, {
    freeze,
  });

export const clearOfflinePwd = (id: string) =>
  tuyaFetch("POST", `/v1.0/smart-lock/devices/${id}/passwords/offline/clear`);

// ── Remote Unlock ─────────────────────────────────
export const requestRemoteUnlock = async (id: string) =>
  tuyaFetch(
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
export const getRecords = (
  id: string,
  type: "unlock" | "alert" = "unlock",
  page = 1
) =>
  tuyaFetch("GET", `/v1.0/smart-lock/devices/${id}/records/${type}`, {
    page_no: page,
    page_size: 50,
  });

// ── Doorbell ──────────────────────────────────────
export const getDoorbellEvents = (id: string, page = 1) =>
  tuyaFetch("GET", `/v1.0/smart-lock/devices/${id}/doorbell/events`, {
    page_no: page,
    page_size: 20,
  });

// ── Members ───────────────────────────────────────
export const listMembers = (id: string) =>
  tuyaFetch("GET", `/v1.0/smart-lock/devices/${id}/members`);

export const addMember = (id: string, mobile: string, name: string) =>
  tuyaFetch("POST", `/v1.0/smart-lock/devices/${id}/members`, { mobile, name });

export const removeMember = (id: string, memberId: string) =>
  tuyaFetch("DELETE", `/v1.0/smart-lock/devices/${id}/members/${memberId}`);

// ── Status ────────────────────────────────────────
export const getFullStatus = (id: string) =>
  tuyaFetch("GET", `/v1.0/devices/${id}/status`);
