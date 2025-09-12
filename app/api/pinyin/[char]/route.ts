// app/api/pinyin/[char]/route.ts
import { NextResponse } from 'next/server';
import { getPinyinForCharacterOnServer } from '@/lib/pinyin.server';

export async function GET(
  request: Request,
  { params }: { params: { char: string } }
) {
  try {
    const character = decodeURIComponent(params.char);

    if (!character || character.length !== 1) {
      return NextResponse.json(
        { error: '请提供单个汉字' },
        { status: 400 }
      );
    }

    const pinyinResult = getPinyinForCharacterOnServer(character);

    return NextResponse.json(pinyinResult);
    
  } catch (error) {
    console.error(`获取拼音API出错 for char: ${params.char}`, error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
