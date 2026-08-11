import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ status: "ok", service: "k-deliver-api", version: "v1" }); }

