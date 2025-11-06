import { listDevices } from "@/lib/tuya/devices";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errorHandler";

export const GET = async () => {
  try {
    const devices = await listDevices();
    return NextResponse.json({ success: true, devices });
  } catch (e) {
    return handleApiError(e);
  }
};
