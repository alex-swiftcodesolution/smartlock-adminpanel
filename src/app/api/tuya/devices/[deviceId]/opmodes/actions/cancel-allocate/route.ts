// src/app/api/tuya/devices/[deviceId]/opmodes/actions/cancel-allocate/route.ts (new route for unbind)

import { cancelAllocateOpmodes } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { z } from "zod";

const unbindSchema = z.object({
  user_id: z.string().min(1),
  unlock_list: z.array(
    z.object({
      code: z.string(),
      unlock_sn: z.number(),
    })
  ),
});

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const body = await req.json();
  const parse = unbindSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json(
      { success: false, error: parse.error.issues[0].message },
      { status: 400 }
    );
  await cancelAllocateOpmodes(deviceId, parse.data);
  return NextResponse.json({ success: true });
};
