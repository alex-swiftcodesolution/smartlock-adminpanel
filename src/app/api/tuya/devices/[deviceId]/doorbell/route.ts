import { getDoorbellEvents } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const page = Number(new URL(req.url).searchParams.get("page") || 1);
  const events = await getDoorbellEvents(deviceId, page);
  return NextResponse.json({ success: true, events });
};
