import { requestRemoteUnlock } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errorHandler";

export const POST = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  try {
    const ticket = await requestRemoteUnlock(deviceId);
    return NextResponse.json({ success: true, ticket });
  } catch (e) {
    return handleApiError(e);
  }
};
