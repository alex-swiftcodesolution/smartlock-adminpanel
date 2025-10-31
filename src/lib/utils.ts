import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EMPTY_HASH =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

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

export const safeHeaders = (
  base: Record<string, string | undefined>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(base).filter(([, v]) => v != null)
  ) as Record<string, string>;
