import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EMPTY_HASH =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/*
export const signRequest = (
  method: string,
  body: string,
  token: string,
  path: string,
  t: string,
  nonce: string,
  clientId: string,
  secret: string
): string => {
  const hash = body
    ? crypto.createHash("sha256").update(body).digest("hex")
    : EMPTY_HASH;
  const str = `${method}\n${hash}\n\n${path}`;
  return crypto
    .createHmac("sha256", secret)
    .update(clientId + token + t + nonce + str)
    .digest("hex")
    .toUpperCase();
};
*/

export const signRequest = (
  method: string,
  body: string,
  token: string,
  path: string, // e.g. "/v1.0/devices/abc/open-logs?page_no=1&page_size=50"
  t: string,
  nonce: string,
  clientId: string,
  secret: string
): string => {
  const [basePath, queryString] = path.split("?");
  const query = queryString
    ? Object.fromEntries(new URLSearchParams(queryString))
    : {};

  const sortedQuery = Object.keys(query)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(query[k])}`)
    .join("&");

  const fullPath = sortedQuery ? `${basePath}?${sortedQuery}` : basePath;

  const hash = body
    ? crypto.createHash("sha256").update(body).digest("hex")
    : EMPTY_HASH;

  const str = `${method.toUpperCase()}\n${hash}\n\n${fullPath}`;

  return crypto
    .createHmac("sha256", secret)
    .update(clientId + token + t + nonce + str)
    .digest("hex")
    .toUpperCase();
};

export const safeHeaders = (
  base: Record<string, string | undefined>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(base).filter(([, v]) => v != null)
  ) as Record<string, string>;

export const eventMap: Record<string, string> = {
  unlock_app: "App",
  unlock_password: "Password",
  unlock_fingerprint: "Fingerprint",
  unlock_card: "Card",
  unlock_face: "Face",
  unlock_key: "Key",
  unlock_temporary: "Temp PWD",
  unlock_dynamic: "Dynamic PWD",
  hijack: "Duress",
  alarm_lock: "Alarm",
  doorbell: "Doorbell",
};
