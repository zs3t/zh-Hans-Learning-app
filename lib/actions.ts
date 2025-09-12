// lib/actions.ts
"use server";

import { prisma } from './db';
// ✨ 1. 【核心修复】从 pinyin.server.ts 导入服务器专用函数
import { getPinyinForCharacterOnServer } from './pinyin.server'; 
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import iconv from 'iconv-lite';
import { Buffer } from 'buffer';

// ... (接口定义和 fixFilenameEncoding 函数保持不变) ...
export interface CustomCharacter {
  id: string;
  char: string;
  pinyin: string[];
  characterSetId: string;
  createdAt?: Date;
}
export interface CustomCharacterSet {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  characters: CustomCharacter[];
}
interface ImportResult {
  success: boolean;
  message?: string;
  error?: string;
  characterSet?: {
    id: string;
    name: string;
  };
}
function fixFilenameEncoding(filename: string): string {
    try {
        const looksLikeMojibake = /[âÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(filename);
        if (!looksLikeMojibake) {
            return filename;
        }
        const latin1Buffer = Buffer.from(filename, 'latin1');
        const utf8Decoded = iconv.decode(latin1Buffer, 'utf8');
        if (/[\u4E00-\u9FA5]/.test(utf8Decoded)) {
            console.log(`文件名 "${filename}" 已修复为 "${utf8Decoded}"`);
            return utf8Decoded;
        }
        return filename;
    } catch (e) {
        console.error(`修复文件名 "${filename}" 失败:`, e);
        return filename;
    }
}


export async function importFont(formData: FormData): Promise<ImportResult> {
  const file = formData.get('fontFile') as File;

  if (!file) {
    return { success: false, error: '请选择一个文件上传。' };
  }

  const correctedFilename = fixFilenameEncoding(file.name);
  
  let textContent: string = '';
  const arrayBuffer = await file.arrayBuffer();
  const nodeBuffer = Buffer.from(arrayBuffer);

  try {
    textContent = iconv.decode(nodeBuffer, 'utf8');
    if (textContent.charCodeAt(0) === 0xFEFF) {
        textContent = textContent.substring(1);
    }
  } catch (e) { /* ignore */ }

  const uniqueCharsUtf8 = new Set(
    textContent.split('')
    .map(c => c.trim())
    .filter(c => c.length === 1 && /[\u4E00-\u9FA5]/.test(c))
  );

  if (uniqueCharsUtf8.size === 0) {
    console.log("UTF-8解码失败或无有效汉字，尝试GBK...");
    try {
      textContent = iconv.decode(nodeBuffer, 'gbk');
    } catch (e) {
      return { success: false, error: '文件编码无法识别，请确保为 UTF-8 或 GBK 编码。' };
    }
  }

  const characters = Array.from(new Set(
        textContent.split('')
        .map(c => c.trim())
        .filter(c => c.length === 1 && /[\u4E00-\u9FA5]/.test(c))
    ));

  if (characters.length === 0) {
    return { success: false, error: '文件中未找到有效汉字。请确保每行一个汉字。' };
  }
  
  let baseFontName = correctedFilename.split('.').slice(0, -1).join('.') || `新字库`;
  let fontName = baseFontName;
  let counter = 2; 

  while (await prisma.characterSet.findUnique({ where: { name: fontName } })) {
    fontName = `${baseFontName} (${counter})`;
    counter++;
  }
  
  const fontDescription = `从文件 "${correctedFilename}" 导入，包含 ${characters.length} 个汉字。`;

  try {
    const newCharacterSet = await prisma.$transaction(async (tx) => {
      await tx.characterSet.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });

      const createdSet = await tx.characterSet.create({
        data: {
          name: fontName,
          description: fontDescription,
          isDefault: true,
        },
      });

      // ✨ 2. 【核心修复】移除 Promise.all 和 async/await，直接同步调用服务器函数
      const characterDataToCreate = characters.map((char) => {
        // ✨ 3. 直接调用，返回的pinyinResults已经是 string[]
        const pinyinResults = getPinyinForCharacterOnServer(char); 
        
        return {
          char: char,
          // ✨ 4. 【核心修复】直接 join 字符串数组，不再需要 .map
          pinyin: pinyinResults.join(','), 
          characterSetId: createdSet.id,
        };
      });

      await tx.character.createMany({ 
        data: characterDataToCreate,
      });
      return createdSet;
    });

    revalidatePath('/');

    return {
      success: true,
      message: `字库 "${newCharacterSet.name}" 导入成功！`,
      characterSet: {
        id: newCharacterSet.id,
        name: newCharacterSet.name,
      },
    };

  } catch (error) {
    console.error('导入字库失败:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
         return { success: false, error: '导入失败，可能存在重复数据。请检查文件内容。' };
    }
    return { success: false, error: error instanceof Error ? `数据库错误: ${error.message}`: '发生未知错误' };
  }
}
