import { getRecords } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

// app/api/tuya/devices/[deviceId]/records/route.ts
export const GET = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const url = new URL(req.url);
  const type = (url.searchParams.get("type") as "unlock" | "alert") || "unlock";
  const page = Number(url.searchParams.get("page") || 1);

  const data = await getRecords(deviceId, type, page);
  return NextResponse.json({
    success: true,
    records: data.logs ?? data.records ?? [],
  });
};
