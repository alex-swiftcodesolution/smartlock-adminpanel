// src/app/api/tuya/devices/[deviceId]/users-enhanced/route.ts (new route for v1.1 list)

import { listUsersEnhanced } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const url = new URL(req.url);
  const keyword = url.searchParams.get("keyword") || undefined;
  const role =
    (url.searchParams.get("role") as "admin" | "normal") || undefined;
  const page_no = Number(url.searchParams.get("page_no") || 1);
  const page_size = Number(url.searchParams.get("page_size") || 10);
  const data = await listUsersEnhanced(deviceId, {
    keyword,
    role,
    page_no,
    page_size,
  });
  return NextResponse.json({ success: true, ...data });
};
