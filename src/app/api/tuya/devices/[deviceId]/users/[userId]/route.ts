// src/app/api/tuya/devices/[deviceId]/users/[userId]/route.ts (new route for user details/update)

import { updateUser, getUser } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  nick_name: z.string().optional(),
  sex: z.union([z.literal(1), z.literal(2)]),
  birthday: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  contact: z.string().optional(),
});

export const GET = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string; userId: string }> }
) => {
  const { deviceId, userId } = await params;
  const user = await getUser(deviceId, userId);
  return NextResponse.json({ success: true, user });
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string; userId: string }> }
) => {
  const { deviceId, userId } = await params;
  const body = await req.json();
  const parse = updateSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json(
      { success: false, error: parse.error.issues[0].message },
      { status: 400 }
    );
  await updateUser(deviceId, userId, parse.data);
  return NextResponse.json({ success: true });
};
