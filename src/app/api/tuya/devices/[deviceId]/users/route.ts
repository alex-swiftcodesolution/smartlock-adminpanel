// src/app/api/tuya/devices/[deviceId]/users/route.ts (new route for basic users)

import { addUser, listUsers, deleteUser } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { z } from "zod";

const addSchema = z.object({
  nick_name: z.string().min(1),
  sex: z.union([z.literal(1), z.literal(2)]),
  birthday: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  contact: z.string().optional(),
});

export const GET = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const { users } = await listUsers(deviceId);
  return NextResponse.json({ success: true, users });
};

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const body = await req.json();
  const parse = addSchema.safeParse(body);
  if (!parse.success)
    return NextResponse.json(
      { success: false, error: parse.error.issues[0].message },
      { status: 400 }
    );
  const { user_id } = await addUser(deviceId, parse.data);
  return NextResponse.json({ success: true, user_id });
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const { userId } = await req.json();
  await deleteUser(deviceId, userId);
  return NextResponse.json({ success: true });
};
