// app/api/pinyin/[char]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getPinyinForCharacterOnServer } from '@/lib/pinyin.server';

// GET /api/pinyin/[char]
export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/pinyin/[char]'>
) {
  const { char } = await ctx.params;

  try {
    const character = decodeURIComponent(char ?? '');

    if (!character || character.length !== 1) {
      return NextResponse.json([], { status: 400 }); // 返回空数组
    }

    const pinyinResult = await getPinyinForCharacterOnServer(character);

    if (!pinyinResult || !Array.isArray(pinyinResult) || pinyinResult.length === 0) {
      return NextResponse.json([], { status: 404 }); // 返回空数组
    }

    // ⚡ 核心修改：直接返回数组
    return NextResponse.json(pinyinResult);
  } catch (error: unknown) {
    console.error(`获取拼音API出错 for char: ${char}`, error);
    return NextResponse.json([], { status: 500 });
  }
}