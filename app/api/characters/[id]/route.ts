// app/api/characters/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/characters/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params; // <-- 已修改
  try {
    const characterSet = await prisma.characterSet.findUnique({
      where: { id },
      include: {
        characters: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!characterSet) {
      return NextResponse.json({ error: '未找到指定ID的字库' }, { status: 404 });
    }

    return NextResponse.json(characterSet);
  } catch (error: unknown) {
    console.error(`获取字库 ${id} 失败:`, error);

    let errorMessage = '获取字库详情失败';
    let errorDetails: string | undefined;

    if (error instanceof Error) {
      errorDetails = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorDetails = (error as { message: string }).message;
    } else {
      errorDetails = String(error);
    }

    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails 
      }, 
      { status: 500 }
    );
  }
}

// DELETE /api/characters/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params; // <-- 已修改
  try {
    await prisma.characterSet.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error(`删除字库 ${id} 失败:`, error);

    let errorMessage = '删除字库失败';
    let errorDetails: string | undefined;

    if (error instanceof Error) {
      errorDetails = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorDetails = (error as { message: string }).message;
    } else {
      errorDetails = String(error);
    }

    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails 
      }, 
      { status: 500 }
    );
  }
}
