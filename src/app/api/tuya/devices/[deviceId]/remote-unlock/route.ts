import { requestRemoteUnlock } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const POST = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const ticket = await requestRemoteUnlock(deviceId);
  return NextResponse.json({ success: true, ticket });
};
