// src/app/api/tuya/devices/[deviceId]/users-enhanced/[userId]/route.ts (new route for v1.1 get)

import { getUserEnhanced } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const GET = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string; userId: string }> }
) => {
  const { deviceId, userId } = await params;
  const user = await getUserEnhanced(deviceId, userId);
  return NextResponse.json({ success: true, user });
};
