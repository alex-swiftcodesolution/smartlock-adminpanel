import { getDevice } from "@/lib/tuya/devices";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errorHandler";

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  try {
    const device = await getDevice(deviceId);
    return NextResponse.json({ success: true, device });
  } catch (e) {
    return handleApiError(e);
  }
};
