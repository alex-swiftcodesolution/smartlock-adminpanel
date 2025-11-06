// src/lib/api/errorHandler.ts
import { NextResponse } from "next/server";

export const handleApiError = (e: unknown) => {
  const message = e instanceof Error ? e.message : "Internal server error";
  return NextResponse.json({ success: false, error: message }, { status: 500 });
};
