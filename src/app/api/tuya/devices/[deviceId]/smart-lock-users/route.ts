// src/app/api/tuya/devices/[deviceId]/smart-lock-users/route.ts (new route for smart-lock users)

import { listSmartLockUsers } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const url = new URL(req.url);
  const codes =
    url.searchParams.get("codes") ||
    "unlock_fingerprint,unlock_card,unlock_password,unlock_face,unlock_hand,unlock_finger_vein";
  const page_no = Number(url.searchParams.get("page_no") || 1);
  const page_size = Number(url.searchParams.get("page_size") || 10);
  const data = await listSmartLockUsers(deviceId, {
    codes,
    page_no,
    page_size,
  });
  return NextResponse.json({ success: true, ...data });
};
