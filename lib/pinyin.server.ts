// lib/pinyin.server.ts (SERVER-ONLY CODE)
import fs from 'fs';
import path from 'path';
import { pinyin } from 'pinyin-pro';

// 在内存中缓存多音字数据
let polyphonicData: Record<string, string[]> | null = null;

function loadPolyphonicData(): Record<string, string[]> {
  if (polyphonicData === null) {
    try {
      const filePath = path.join(process.cwd(), 'lib/data/polyphonic.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      polyphonicData = JSON.parse(fileContent);
      console.log('✅ [Server] 自定义多音字文件 (polyphonic.json) 加载成功。');
    } catch (error) {
      console.error('⚠️ [Server] 无法加载自定义多音字文件。', error);
      polyphonicData = {};
    }
  }
  return polyphonicData!;
}

/**
 * 【服务器端专用】获取汉字的拼音逻辑。
 * @param character 单个汉字
 * @returns 返回一个包含拼音字符串的数组
 */
export function getPinyinForCharacterOnServer(character: string): string[] {
  if (!character || character.trim().length !== 1) {
    return [];
  }

  const customPinyins = loadPolyphonicData();

  if (customPinyins[character]) {
    return customPinyins[character];
  }

  const pinyinReadings = pinyin(character, {
    toneType: 'symbol',
    type: 'array',
  });
  
  const validPinyinRegex = /^[a-zǖǘǚǜüīíǐìāáǎàēéěèōóǒòūúǔù]+$/i;
  const cleanedReadings = pinyinReadings.filter(p => validPinyinRegex.test(p));

  if (cleanedReadings.length > 0) {
    return [cleanedReadings[0]];
  }

  return [];
}
