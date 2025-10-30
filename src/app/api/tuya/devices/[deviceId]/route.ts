// app/api/tuya/devices/[deviceId]/route.ts

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Environment variables
const accessId = process.env.TUYA_ACCESS_ID as string;
const secret = process.env.TUYA_SECRET_KEY as string;
const baseUrl = (process.env.TUYA_BASE_URL ?? "").replace(/\/$/, "");

/* --- Re-usable Helper Functions --- */
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

async function getTuyaToken(): Promise<{ access_token: string }> {
  const method = "GET";
  const urlPath = "/v1.0/token?grant_type=1";
  const url = `${baseUrl}${urlPath}`;
  const t = Date.now().toString();
  const nonce = crypto.randomUUID();
  const sign = buildSign(method, "", urlPath, t, nonce);
  const headers = safeHeaders({
    client_id: accessId,
    sign,
    t,
    sign_method: "HMAC-SHA256",
    nonce,
  });

  const res = await fetch(url, { headers });
  const data = await res.json();

  if (!data.success || !data.result?.access_token) {
    throw new Error(`Token failed: ${data.msg ?? "Unknown error"}`);
  }

  return data.result;
}

/* --- GET Handler (Next.js 15+ Compatible) --- */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> } // ← Now a Promise!
) {
  try {
    // Must await params in Next.js 15+
    const { deviceId } = await params;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "Device ID is required" },
        { status: 400 }
      );
    }

    const { access_token: token } = await getTuyaToken();

    const method = "GET";
    const urlPath = `/v1.0/devices/${deviceId}`;
    const url = `${baseUrl}${urlPath}`;
    const t = Date.now().toString();
    const nonce = crypto.randomUUID();
    const sign = buildSign(method, token, urlPath, t, nonce);

    const headers = safeHeaders({
      client_id: accessId,
      access_token: token,
      sign,
      t,
      sign_method: "HMAC-SHA256",
      nonce,
    });

    const res = await fetch(url, {
      headers,
      cache: "no-store", // Ensures fresh data
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(`API error [${data.code}]: ${data.msg}`);
    }

    return NextResponse.json({ success: true, device: data.result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Tuya single device API error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
