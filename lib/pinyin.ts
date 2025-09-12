// lib/pinyin.ts (CLIENT-SAFE CODE)

// 这个类型现在表示 getPinyinForCharacter 函数的返回值
export type PinyinResult = string[];

/**
 * 【客户端专用】通过调用后端API获取汉字的拼音。
 * 这个函数现在是安全的，可以在任何客户端组件中使用。
 * @param character 单个汉字
 * @returns 返回一个包含拼音字符串的 Promise
 */
export async function getPinyinForCharacter(character: string): Promise<PinyinResult> {
  // 1. 输入验证
  if (!character || character.trim().length !== 1) {
    return [];
  }

  try {
    // 2. 调用我们创建的API端点
    const response = await fetch(`/api/pinyin/${encodeURIComponent(character)}`);

    if (!response.ok) {
      console.error(`获取拼音失败 for char: ${character}, Status: ${response.status}`);
      return [];
    }

    // 3. 解析JSON并返回结果
    const data: PinyinResult = await response.json();
    return data;

  } catch (error) {
    console.error(`网络请求失败 for pinyin of ${character}:`, error);
    return [];
  }
}
