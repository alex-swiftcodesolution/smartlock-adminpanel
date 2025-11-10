// src/app/api/tuya/devices/[deviceId]/opmodes/[userId]/route.ts (new route for opmodes)

import { getUserOpmodes } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string; userId: string }> }
) => {
  const { deviceId, userId } = await params;
  const url = new URL(req.url);
  const codes = url.searchParams.get("codes") || undefined;
  const unlock_name = url.searchParams.get("unlock_name") || undefined;
  const page_no = Number(url.searchParams.get("page_no") || 1);
  const page_size = Number(url.searchParams.get("page_size") || 10);
  const data = await getUserOpmodes(deviceId, userId, {
    codes,
    unlock_name,
    page_no,
    page_size,
  });
  return NextResponse.json({ success: true, ...data });
};
