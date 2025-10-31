/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDevice } from "@/lib/tuya/devices";
import { NextResponse } from "next/server";

export const GET = async (
  _: any,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  try {
    const device = await getDevice(deviceId);
    return NextResponse.json({ success: true, device });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
};
