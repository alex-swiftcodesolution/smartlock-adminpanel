import { tuyaFetch } from "./client";

export const unlockDevice = async (deviceId: string) => {
  const ticket = await tuyaFetch<{ ticket_id: string }>(
    "POST",
    `/v1.0/devices/${deviceId}/door-lock/password-ticket`,
    {}
  );
  return tuyaFetch(
    "POST",
    `/v1.0/smart-lock/devices/${deviceId}/password-free/door-operate`,
    { ticket_id: ticket.ticket_id, open: true }
  );
};

export const lockDevice = async (deviceId: string) =>
  tuyaFetch("POST", `/v1.0/devices/${deviceId}/commands`, {
    commands: [{ code: "lock_motor_state", value: true }],
  });
