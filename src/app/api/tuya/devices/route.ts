import crypto from "crypto";
import { NextResponse } from "next/server";

/* -------------------------------------------------
   Environment (validated at import time)
   ------------------------------------------------- */
const accessId = process.env.TUYA_ACCESS_ID as string;
const secret = process.env.TUYA_SECRET_KEY as string;
const baseUrl = (process.env.TUYA_BASE_URL ?? "").replace(/\/$/, "");

// --- NEW ---
// This is the UID of the linked App Account from your Tuya IoT Platform.
const appAccountUid = process.env.TUYA_APP_ACCOUNT_UID as string;

// --- UPDATED ---
// Added validation for the new environment variable.
if (!accessId || !secret || !baseUrl || !appAccountUid) {
  throw new Error(
    "Missing TUYA_ACCESS_ID, TUYA_SECRET_KEY, TUYA_BASE_URL, or TUYA_APP_ACCOUNT_UID in .env file"
  );
}

/* -------------------------------------------------
   Types
   ------------------------------------------------- */
interface TuyaTokenResult {
  access_token: string;
  refresh_token: string;
  expire_time: number;
  uid: string;
}

interface TuyaDevice {
  id: string;
  name: string;
  model?: string;
  icon?: string;
  online: boolean;
  product_id: string;
  product_name: string;
  category: string;
  local_key?: string;
  ip?: string;
  lat?: string;
  lon?: string;
  create_time: number;
  update_time: number;
  [key: string]: unknown;
}

interface TuyaResponse<T> {
  success: boolean;
  result?: T;
  code?: number;
  msg?: string;
  t: number;
  tid: string;
}

/* -------------------------------------------------
   Helpers
   ------------------------------------------------- */
const EMPTY_BODY_SHA256 =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function buildSign(
  method: string,
  token: string,
  urlPathWithQuery: string,
  t: string,
  nonce: string
): string {
  const stringToSign = `${method}\n${EMPTY_BODY_SHA256}\n\n${urlPathWithQuery}`;
  const strToSign = accessId + token + t + nonce + stringToSign;

  return crypto
    .createHmac("sha256", secret)
    .update(strToSign)
    .digest("hex")
    .toUpperCase();
}

function safeHeaders(
  base: Record<string, string | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(base)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/* -------------------------------------------------
   STEP 1 – Get Project Token
   ------------------------------------------------- */
async function getTuyaToken(): Promise<TuyaTokenResult> {
  const method = "GET";
  const urlPath = "/v1.0/token";
  const query = "grant_type=1";
  const fullPath = `${urlPath}?${query}`;
  const url = `${baseUrl}${fullPath}`;

  const t = Date.now().toString();
  const nonce = crypto.randomUUID();

  const sign = buildSign(method, "", fullPath, t, nonce);

  const headers = safeHeaders({
    client_id: accessId,
    sign,
    t,
    sign_method: "HMAC-SHA256",
    nonce,
  });

  console.log("Fetching Tuya token…");
  const res = await fetch(url, { headers });
  const data = (await res.json()) as TuyaResponse<TuyaTokenResult>;

  console.log("Token response:", data);

  if (!data.success || !data.result) {
    throw new Error(`Token failed: ${data.msg ?? "Unknown token error"}`);
  }
  return data.result;
}

/* -------------------------------------------------
   STEP 2 – List User's Devices (Corrected)
   ------------------------------------------------- */
export async function GET() {
  try {
    const { access_token: token } = await getTuyaToken();

    const method = "GET";
    // --- UPDATED ---
    // Switched to the user-centric endpoint using the UID from .env
    const urlPath = `/v1.0/users/${appAccountUid}/devices`;
    const url = `${baseUrl}${urlPath}`; // This endpoint does not need query params

    const t = Date.now().toString();
    const nonce = crypto.randomUUID();

    // The signature must be built with the correct, full path
    const sign = buildSign(method, token, urlPath, t, nonce);

    const headers = safeHeaders({
      client_id: accessId,
      access_token: token,
      sign,
      t,
      sign_method: "HMAC-SHA256",
      nonce,
    });

    console.log("Fetching devices from (user endpoint):", url);
    console.log("Headers for device fetch:", {
      client_id: accessId,
      access_token: token,
      sign,
      t,
      nonce,
    });

    const res = await fetch(url, { headers });

    // --- UPDATED ---
    // The response for this endpoint has a different structure for the 'result' field.
    // It's a direct array of devices.
    const data = (await res.json()) as TuyaResponse<TuyaDevice[]>;

    console.log("Devices response:", data);

    if (!data.success) {
      // Provide more detailed error logging from the Tuya API
      throw new Error(`API error [${data.code}]: ${data.msg}`);
    }

    // --- UPDATED ---
    // The result is the array itself, not an object containing a 'list' property.
    const devices = data.result ?? [];

    return NextResponse.json({
      success: true,
      devices: devices,
      total: devices.length,
      fetched_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Tuya API error in GET handler:", err);
    return NextResponse.json(
      { success: false, error: message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
