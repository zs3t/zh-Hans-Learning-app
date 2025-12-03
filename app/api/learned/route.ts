// app/api/learned/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const validateChar = (char: unknown): string | null => {
  if (typeof char !== 'string') return null;
  const trimmed = char.trim();
  if (trimmed.length !== 1) return null;
  return trimmed;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const char = validateChar(searchParams.get('char'));

  if (!char) {
    return NextResponse.json({ error: '查询参数 char 必须是单个汉字。' }, { status: 400 });
  }

  try {
    const entry = await prisma.learnedCharacter.findUnique({ where: { char } });
    return NextResponse.json({ learned: Boolean(entry) });
  } catch (error: unknown) {
    console.error('查询已学会字失败:', error);
    return NextResponse.json({ error: '服务器内部错误。' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const char = validateChar(body?.char);

    if (!char) {
      return NextResponse.json({ error: '请求体 char 必须是单个汉字。' }, { status: 400 });
    }

    await prisma.learnedCharacter.upsert({
      where: { char },
      update: {},
      create: { char },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('标记已学会字失败:', error);
    return NextResponse.json({ error: '服务器内部错误。' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const char = validateChar(body?.char);

    if (!char) {
      return NextResponse.json({ error: '请求体 char 必须是单个汉字。' }, { status: 400 });
    }

    try {
      await prisma.learnedCharacter.delete({ where: { char } });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return new NextResponse(null, { status: 204 });
      }
      throw error;
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error('取消标记已学会字失败:', error);
    return NextResponse.json({ error: '服务器内部错误。' }, { status: 500 });
  }
}
