import { createPassword, clearOfflinePwd } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const { name, password } = await req.json();
  const pwd = await createPassword(deviceId, {
    name,
    password,
    type: "dynamic",
  });
  return NextResponse.json({ success: true, pwd });
};

export const DELETE = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  await clearOfflinePwd(deviceId);
  return NextResponse.json({ success: true });
};
