// app/api/characters/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/characters/[id]
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/characters/[id]'>
) {
  // NOTE: In Next.js 15+, params can be async — use await
  const { id } = await ctx.params;

  try {
    const characterSet = await prisma.characterSet.findUnique({
      where: { id },
      include: {
        characters: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!characterSet) {
      return NextResponse.json({ error: '未找到指定ID的字库' }, { status: 404 });
    }

    return NextResponse.json(characterSet);
  } catch (error: unknown) {
    console.error(`获取字库 ${id} 失败:`, error);

    const details =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);

    return NextResponse.json(
      { error: '获取字库详情失败', details },
      { status: 500 }
    );
  }
}

// DELETE /api/characters/[id]
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<'/api/characters/[id]'>
) {
  const { id } = await ctx.params;

  try {
    await prisma.characterSet.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error(`删除字库 ${id} 失败:`, error);

    const details =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);

    return NextResponse.json(
      { error: '删除字库失败', details },
      { status: 500 }
    );
  }
}