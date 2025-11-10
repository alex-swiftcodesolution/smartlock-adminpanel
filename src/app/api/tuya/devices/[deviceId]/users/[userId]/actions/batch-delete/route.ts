// src/app/api/tuya/devices/[deviceId]/users/actions/batch-delete/route.ts (new route for batch delete)

import { batchDeleteUsers } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { z } from "zod";

const batchSchema = z.object({
  user_ids: z.string().min(1), // comma-separated
});

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const body = await req.json();
  const parse = batchSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json(
      { success: false, error: parse.error.issues[0].message },
      { status: 400 }
    );
  await batchDeleteUsers(deviceId, parse.data.user_ids);
  return NextResponse.json({ success: true });
};
