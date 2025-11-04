// src/app/api/tuya/devices/[deviceId]/status/route.ts
import { getFullStatus } from "@/lib/tuya/commands";
import { NextResponse } from "next/server";

type DP = { code: string; value: boolean | number };

export const GET = async (
  _: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) => {
  const { deviceId } = await params;
  const status = (await getFullStatus(deviceId)) as DP[];

  const battery =
    status.find((s) =>
      ["residual_electricity", "battery_percentage"].includes(s.code)
    )?.value ?? 0;
  const door = status.find((s) => s.code === "door_contact_state")?.value;
  const bolt = status.find((s) => s.code === "lock_motor_state")?.value;

  return NextResponse.json({ success: true, battery, door, bolt });
};
