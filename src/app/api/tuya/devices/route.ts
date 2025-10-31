/* eslint-disable @typescript-eslint/no-explicit-any */
import { listDevices } from "@/lib/tuya/devices";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const devices = await listDevices();
    return NextResponse.json({ success: true, devices });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
};
