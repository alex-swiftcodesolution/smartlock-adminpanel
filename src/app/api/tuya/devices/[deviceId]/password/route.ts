/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPassword } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const body = await req.json();
  try {
    const pwd = await createPassword(deviceId, body);
    return NextResponse.json({ success: true, password: pwd });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
};
