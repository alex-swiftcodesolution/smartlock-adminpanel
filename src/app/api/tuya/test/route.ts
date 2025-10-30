import { NextResponse } from "next/server";

const baseUrl = process.env.TUYA_BASE_URL!;

export async function GET() {
  try {
    const res = await fetch(`${baseUrl}/v1.0/time`);
    const data = await res.json();
    console.log("Tuya time endpoint response:", data);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error testing Tuya endpoint:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
