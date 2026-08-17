import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthResponse } from "@/lib/auth";
import { z } from "zod";

const menuItemSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  available: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function GET() {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuthResponse();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const item = await prisma.menuItem.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}
