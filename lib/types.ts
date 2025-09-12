// lib/types.ts

// 从 Prisma 模型的字段中派生类型，更健壮
import { CharacterSet as PrismaCharacterSet, Character as PrismaCharacter } from '@prisma/client';

export type CharacterResult = {
  char: string;
  pinyin: string[]; // 拼音作为数组
};

export type Character = Omit<PrismaCharacter, 'pinyin'> & {
  pinyin: string[]; // 覆盖 pinyin 字段为 string[]
};

export type CharacterSet = Omit<PrismaCharacterSet, 'characters'> & {
  characters: Character[]; // 包含关联的 Character 数组
};

// 用于前端显示/交互的CharacterSet简要信息
export type SimpleCharacterSet = Omit<PrismaCharacterSet, 'characters'> & {
  characterCount: number;
};


// HanziWriter 的类型定义，从 page.tsx 复制过来
import HanziWriter from 'hanzi-writer';
export type HanziWriterInstance = ReturnType<typeof HanziWriter.create>;

// 拼音数据结构 (如果 lib/pinyin.ts 是这样的)
export interface PinyinResult {
  pinyin: string;
  // 其他可能的属性, e.g., tone, type
}
