import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthResponse } from "@/lib/auth";
import { z } from "zod";

const dailySpecialSchema = z.object({
  date: z.string().min(1), // "YYYY-MM-DD"
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  available: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const upcoming = searchParams.get("upcoming");

  const items = await prisma.dailySpecial.findMany({
    where: upcoming
      ? { date: { gte: new Date(new Date().toISOString().slice(0, 10)) } }
      : undefined,
    orderBy: { date: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuthResponse();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsed = dailySpecialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { date, ...rest } = parsed.data;
  try {
    const item = await prisma.dailySpecial.upsert({
      where: { date: new Date(date) },
      update: rest,
      create: { ...rest, date: new Date(date) },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível guardar." }, { status: 400 });
  }
}
