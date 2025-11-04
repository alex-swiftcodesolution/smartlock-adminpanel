// app/api/tuya/devices/[deviceId]/commands/route.ts
import { lockDevice, unlockDevice } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { action } = await req.json();
  const { deviceId } = await params;

  if (!["lock", "unlock"].includes(action)) {
    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  }

  try {
    if (action === "unlock") {
      await unlockDevice(deviceId);
    } else {
      await lockDevice(deviceId);
    }

    return NextResponse.json({ success: true }); // Clean success
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
};
