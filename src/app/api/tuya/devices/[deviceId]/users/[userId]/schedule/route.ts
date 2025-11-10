// src/app/api/tuya/devices/[deviceId]/users/[userId]/schedule/route.ts (new route for schedule)

import { updateUserSchedule } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { z } from "zod";

const scheduleSchema = z.object({
  permanent: z.boolean().optional(),
  effective_time: z.number().optional(),
  expired_time: z.number().optional(),
  schedule_details: z
    .array(
      z.object({
        start_minute: z.number(),
        end_minute: z.number(),
        working_day: z.number(),
        time_zone_id: z.string().optional(),
        all_day: z.boolean().optional(),
      })
    )
    .optional(),
});

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string; userId: string }> }
) => {
  const { deviceId, userId } = await params;
  const body = await req.json();
  const parse = scheduleSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json(
      { success: false, error: parse.error.issues[0].message },
      { status: 400 }
    );
  await updateUserSchedule(deviceId, userId, parse.data);
  return NextResponse.json({ success: true });
};
