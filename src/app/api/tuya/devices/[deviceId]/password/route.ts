// src/app/api/tuya/devices/[deviceId]/password/route.ts
import { createPassword } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errorHandler";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
  type: z.enum(["temp", "one_time", "dynamic"]).optional().default("temp"),
});

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const body = await req.json();

  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { success: false, error: parse.error.issues[0].message },
      { status: 400 }
    );
  }

  try {
    const pwd = await createPassword(deviceId, parse.data);
    return NextResponse.json({ success: true, password: pwd });
  } catch (e) {
    return handleApiError(e);
  }
};
