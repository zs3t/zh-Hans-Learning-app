// app/api/learned/export/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const learnedChars = await prisma.learnedCharacter.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const content = learnedChars.map((entry) => entry.char).join('\n');

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="learned-characters.txt"',
      },
    });
  } catch (error: unknown) {
    console.error('导出已学会字库失败:', error);
    return NextResponse.json({ error: '服务器内部错误，导出失败。' }, { status: 500 });
  }
}
