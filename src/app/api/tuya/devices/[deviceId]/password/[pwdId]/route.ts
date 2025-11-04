import { deletePassword, freezePassword } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const DELETE = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string; pwdId: string }> }
) => {
  const { deviceId, pwdId } = await params;
  await deletePassword(deviceId, pwdId);
  return NextResponse.json({ success: true });
};

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string; pwdId: string }> }
) => {
  const { deviceId, pwdId } = await params;
  const { freeze } = await req.json();
  await freezePassword(deviceId, pwdId, freeze);
  return NextResponse.json({ success: true });
};
