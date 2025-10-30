// app/api/tuya/devices/[deviceId]/commands/route.ts

import crypto from "crypto";
import { NextResponse } from "next/server";

// Again, these should be moved to a shared helper file in a real app.
const accessId = process.env.TUYA_ACCESS_ID as string;
const secret = process.env.TUYA_SECRET_KEY as string;
const baseUrl = (process.env.TUYA_BASE_URL ?? "").replace(/\/$/, "");

/* --- Re-usable Helper Functions --- */
function safeHeaders(
  base: Record<string, string | undefined>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(base)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

// !! IMPORTANT: New sign function for POST requests with a body !!
function buildSignWithBody(
  method: string,
  body: string,
  token: string,
  urlPath: string,
  t: string,
  nonce: string
): string {
  const bodyHash = crypto.createHash("sha256").update(body).digest("hex");
  const stringToSign = `${method}\n${bodyHash}\n\n${urlPath}`;
  const strToSign = accessId + token + t + nonce + stringToSign;
  return crypto
    .createHmac("sha256", secret)
    .update(strToSign)
    .digest("hex")
    .toUpperCase();
}

async function getTuyaToken(): Promise<{ access_token: string }> {
  // Same token function as before
  const method = "GET";
  const urlPath = "/v1.0/token?grant_type=1";
  const url = `${baseUrl}${urlPath}`;
  const t = Date.now().toString();
  const nonce = crypto.randomUUID();
  const sign = buildSignWithBody(method, "", "", urlPath, t, nonce); // Using empty body for GET
  const headers = safeHeaders({
    client_id: accessId,
    sign,
    t,
    sign_method: "HMAC-SHA256",
    nonce,
  });
  const res = await fetch(url, { headers });
  const data = await res.json();
  if (!data.success) throw new Error("Token fetch failed");
  return data.result;
}

/* --- The POST Handler for Sending Commands --- */
export async function POST(
  req: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    // --- THE FIX ---
    // 1. Await the request body first.
    const body = await req.json();

    // 2. Now, it's safe to access params.
    const { deviceId } = params;

    if (!body.commands) {
      return NextResponse.json(
        { success: false, error: "Commands are required in body" },
        { status: 400 }
      );
    }

    const { access_token: token } = await getTuyaToken();
    const method = "POST";
    const urlPath = `/v1.0/devices/${deviceId}/commands`;
    const url = `${baseUrl}${urlPath}`;
    const t = Date.now().toString();
    const nonce = crypto.randomUUID();
    const bodyString = JSON.stringify(body);

    const sign = buildSignWithBody(
      method,
      bodyString,
      token,
      urlPath,
      t,
      nonce
    );

    const headers = safeHeaders({
      "Content-Type": "application/json",
      client_id: accessId,
      access_token: token,
      sign,
      t,
      sign_method: "HMAC-SHA256",
      nonce,
    });

    const res = await fetch(url, { method, headers, body: bodyString });
    const data = await res.json();

    // Check the response from Tuya and return it
    if (!data.success) {
      console.error("Tuya command failed:", data);
      // Forward the specific error message from Tuya to the client
      return NextResponse.json(
        { success: false, error: data.msg || "Unknown Tuya API error" },
        { status: 400 }
      );
    }

    return NextResponse.json(data); // Forward the successful Tuya response
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Tuya command API error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
