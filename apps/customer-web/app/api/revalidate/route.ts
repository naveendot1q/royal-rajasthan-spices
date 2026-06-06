import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-revalidate-token");
  if (token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path, tag, type } = await req.json();

  if (tag) revalidateTag(tag);
  if (path) revalidatePath(path, type || "page");

  return NextResponse.json({ revalidated: true, timestamp: Date.now() });
}
