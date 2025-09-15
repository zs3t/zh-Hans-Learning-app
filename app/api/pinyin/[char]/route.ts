// app/api/pinyin/[char]/route.ts
import { NextResponse } from 'next/server';
import { getPinyinForCharacterOnServer } from '@/lib/pinyin.server';

export async function GET(
  request: Request,
  { params }: { params: { char: string } }
) {
  const { char } = await params; // <-- 已修改：在函数开头 await params
  try {
    const character = decodeURIComponent(char);

    if (!character || character.length !== 1) {
      return NextResponse.json(
        { error: '请提供单个汉字' },
        { status: 400 }
      );
    }

    const pinyinResult = getPinyinForCharacterOnServer(character);

    return NextResponse.json(pinyinResult);
    
  } catch (error) {
    console.error(`获取拼音API出错 for char: ${char}`, error); // <-- 现在可以安全使用 char
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
