import { lockDevice, unlockDevice } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errorHandler";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["lock", "unlock"]),
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
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  }

  const { action } = parse.data;

  try {
    if (action === "unlock") await unlockDevice(deviceId);
    else await lockDevice(deviceId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
};
