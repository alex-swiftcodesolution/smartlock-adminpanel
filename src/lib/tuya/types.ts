// lib/tuya/types.ts
export interface TuyaToken {
  access_token: string;
  refresh_token: string;
  expire_time: number;
  uid: string;
}

export interface TuyaDevice {
  id: string;
  name: string;
  online: boolean;
  product_name: string;
  status?: { code: string; value: unknown }[];
  [k: string]: unknown;
}

export interface TuyaResponse<T> {
  success: boolean;
  result?: T;
  code?: number;
  msg?: string;
}
