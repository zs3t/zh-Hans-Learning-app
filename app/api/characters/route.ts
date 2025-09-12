// 文件路径: app/api/characters/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// ✨ 1. 修改导入，指向新的服务器专用文件
import { getPinyinForCharacterOnServer } from '@/lib/pinyin.server'; 

// GET 请求保持不变
export async function GET() {
  // ... (您的 GET 代码无需修改)
  try {
    const characterSets = await prisma.characterSet.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { characters: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const simpleCharacterSets = characterSets.map((set: { id: string; name: string; _count: { characters: number } }) => ({
      id: set.id,
      name: set.name,
      characterCount: set._count.characters,
    }));
    return NextResponse.json(simpleCharacterSets);
  } catch (error: any) {
    console.error("Failed to fetch character sets:", error);
    return NextResponse.json(
      { message: "获取字库列表失败", error: error.message },
      { status: 500 }
    );
  }
}



// POST 请求 (修改的部分)
interface PostRequestBody {
  name: string;
  description?: string;
  characters: string[];
}
export async function POST(request: Request) {
  let body: PostRequestBody | undefined = undefined;
  try {
    body = await request.json();
    if (!body) {
      return NextResponse.json({ error: '无效的请求体' }, { status: 400 });
    }
    const { name, description, characters } = body;
    if (!name || !characters || !Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json({ error: '字库名称和汉字列表不能为空' }, { status: 400 });
    }
    const uniqueChars = Array.from(new Set(characters));
    
    // ✨ 2. 直接调用服务器函数，这里不再是异步 Promise.all
    const characterDataForCreation = uniqueChars.map((char) => {
      // 直接同步调用服务器函数
      const pinyinArray = getPinyinForCharacterOnServer(char); 
      return { 
        char, 
        pinyin: pinyinArray.join(',') // 将 ["háng", "xíng"] 变为 "háng,xíng"
      };
    });

    const newSet = await prisma.characterSet.create({
      data: {
        name,
        description: description || null,
        characters: { create: characterDataForCreation },
      },
      include: { characters: true },
    });
    return NextResponse.json(newSet, { status: 201 });
  } catch (error: any) {
    console.error("创建字库失败:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: '请求体不是有效的JSON格式。' }, { status: 400 });
    }
    if (error.code === 'P2002' && error.meta?.target.includes('name')) {
      const setName = body?.name || '提供的名称';
      return NextResponse.json({ error: `已存在名为 "${setName}" 的字库，请使用其他名称。` }, { status: 409 });
    }
    return NextResponse.json({ error: '创建字库时发生服务器内部错误' }, { status: 500 });
  }
}
