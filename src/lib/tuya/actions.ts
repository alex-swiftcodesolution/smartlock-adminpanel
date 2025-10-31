export const sendLockCommand = async (
  id: string,
  action: "lock" | "unlock"
) => {
  const res = await fetch(`/api/tuya/devices/${id}/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error("Network error");
  }

  if (!data.success) {
    throw new Error(data.error ?? data.msg ?? "Command failed");
  }

  return data;
};
