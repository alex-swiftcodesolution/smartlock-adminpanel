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
