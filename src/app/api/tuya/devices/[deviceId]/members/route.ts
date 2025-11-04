import { listMembers, addMember, removeMember } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const GET = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const members = await listMembers(deviceId);
  return NextResponse.json({ success: true, members });
};

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const { mobile, name } = await req.json();
  const member = await addMember(deviceId, mobile, name);
  return NextResponse.json({ success: true, member });
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const { memberId } = await req.json();
  await removeMember(deviceId, memberId);
  return NextResponse.json({ success: true });
};
