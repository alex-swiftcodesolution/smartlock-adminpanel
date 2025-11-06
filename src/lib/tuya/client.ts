import { signRequest, safeHeaders } from "../utils";
import { TuyaToken, TuyaResponse } from "./types";

const {
  TUYA_ACCESS_ID: clientId,
  TUYA_SECRET_KEY: secret,
  TUYA_BASE_URL: base = "",
} = process.env;

if (!clientId || !secret || !base) throw new Error("Missing Tuya env vars");

const BASE_URL = base.replace(/\/$/, "");

let cachedToken: TuyaToken | null = null;
let tokenExpiry = 0;

const getToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken.access_token;

  const t = Date.now().toString();
  const nonce = crypto.randomUUID();
  const path = "/v1.0/token?grant_type=1";
  const sign = signRequest("GET", "", "", path, t, nonce, clientId!, secret!);

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: safeHeaders({
      client_id: clientId,
      sign,
      t,
      sign_method: "HMAC-SHA256",
      nonce,
    }),
  });
  const data = (await res.json()) as TuyaResponse<TuyaToken>;
  if (!data.success) throw new Error(data.msg);

  cachedToken = data.result!;
  tokenExpiry = Date.now() + data.result!.expire_time * 1000 - 60000;
  return cachedToken.access_token;
};

export const tuyaFetch = async <T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> => {
  const token = await getToken();
  const bodyStr = body ? JSON.stringify(body) : "";
  const t = Date.now().toString();
  const nonce = crypto.randomUUID();
  const sign = signRequest(
    method,
    bodyStr,
    token,
    path,
    t,
    nonce,
    clientId!,
    secret!
  );

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: safeHeaders({
      "Content-Type": body ? "application/json" : undefined,
      client_id: clientId,
      access_token: token,
      sign,
      t,
      sign_method: "HMAC-SHA256",
      nonce,
    }),
    body: method !== "GET" && bodyStr ? bodyStr : undefined,
  });
  const data = (await res.json()) as TuyaResponse<T>;
  if (!data.success) throw new Error(data.msg);
  return data.result!;
};
