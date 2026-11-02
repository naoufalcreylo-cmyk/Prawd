import { NextResponse } from "next/server";
import { getArticles, toSearchEntry } from "@/lib/content";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(getArticles().map(toSearchEntry));
}
