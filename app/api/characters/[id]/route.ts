// app/api/characters/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/characters/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const characterSet = await prisma.characterSet.findUnique({
      where: { id },
      include: {
        characters: {
          orderBy: {
            createdAt: 'asc', // 保持这个修正
          },
        },
      },
    });

    if (!characterSet) {
      return NextResponse.json({ error: '未找到指定ID的字库' }, { status: 404 });
    }

    return NextResponse.json(characterSet);
  } catch (error: unknown) { // 可以显式声明为 unknown，但默认就是
    console.error(`获取字库 ${id} 失败:`, error);

    let errorMessage = '获取字库详情失败';
    let errorDetails: string | undefined; // 使用 undefined 或 string | null

    // 检查 error 是否是 Error 实例，以便安全地访问其 message 属性
    if (error instanceof Error) {
      errorDetails = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      // 有些错误可能不是 Error 实例，但有 message 属性
      errorDetails = (error as { message: string }).message;
    } else {
      // 如果不是 Error 实例，也不是带有 message 的对象，就将其转换为字符串
      errorDetails = String(error);
    }

    // 根据需求返回 errorDetails
    // 生产环境中，可能不希望将内部错误详情暴露给客户端
    // 但在开发环境中，这有助于调试
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
  const id = params.id;
  try {
    await prisma.characterSet.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) { // 同样的，这里也需要处理
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
