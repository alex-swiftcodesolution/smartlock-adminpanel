// src/app/api/tuya/devices/[deviceId]/users/[userId]/actions/role/route.ts

import { updateUserRole } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["admin", "normal"]),
});

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string; userId: string }> }
) => {
  const { deviceId, userId } = await params;
  const body = await req.json();
  const parse = roleSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json(
      { success: false, error: parse.error.issues[0].message },
      { status: 400 }
    );
  await updateUserRole(deviceId, userId, parse.data.role);
  return NextResponse.json({ success: true });
};
