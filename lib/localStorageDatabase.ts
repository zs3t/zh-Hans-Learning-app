// 使用localStorage作为备用持久化存储方案

export interface Character {
  char: string;
  pinyin: string[];
  strokeOrder: string[];
}

export interface CharacterSet {
  id: string;
  name: string;
  description: string;
  characters: Character[];
}

// 生成会话ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 获取或创建会话ID
export function getOrCreateSession(): string {
  let sessionId = localStorage.getItem('user-session-id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('user-session-id', sessionId);
  }
  return sessionId;
}

// 保存字库到localStorage
export function saveCharacterSet(characterSet: CharacterSet): boolean {
  try {
    const sessionId = getOrCreateSession();
    
    // 获取现有字库
    const existingSets = getCharacterSets();
    
    // 检查是否已存在相同ID的字库
    const existingIndex = existingSets.findIndex(set => set.id === characterSet.id);
    
    if (existingIndex >= 0) {
      // 更新现有字库
      existingSets[existingIndex] = {
        ...characterSet,
        id: characterSet.id // 确保ID不变
      };
    } else {
      // 添加新字库
      existingSets.push(characterSet);
    }
    
    // 保存到localStorage
    localStorage.setItem('character-sets', JSON.stringify(existingSets));
    localStorage.setItem('last-updated', new Date().toISOString());
    
    console.log(`字库 "${characterSet.name}" 已保存到localStorage`);
    return true;
  } catch (error) {
    console.error('保存字库到localStorage失败:', error);
    return false;
  }
}

// 从localStorage获取所有字库
export function getCharacterSets(): CharacterSet[] {
  try {
    const saved = localStorage.getItem('character-sets');
    if (saved) {
      const sets = JSON.parse(saved) as CharacterSet[];
      console.log(`从localStorage加载了 ${sets.length} 个字库`);
      return sets;
    }
    return [];
  } catch (error) {
    console.error('从localStorage获取字库失败:', error);
    return [];
  }
}

// 删除字库
export function deleteCharacterSet(characterSetId: string): boolean {
  try {
    const existingSets = getCharacterSets();
    const filteredSets = existingSets.filter(set => set.id !== characterSetId);
    
    if (filteredSets.length < existingSets.length) {
      localStorage.setItem('character-sets', JSON.stringify(filteredSets));
      localStorage.setItem('last-updated', new Date().toISOString());
      console.log(`字库 ID "${characterSetId}" 已从localStorage删除`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('从localStorage删除字库失败:', error);
    return false;
  }
}

// 清理过期数据（可选）
export function cleanupOldData(): void {
  try {
    const lastUpdated = localStorage.getItem('last-updated');
    if (lastUpdated) {
      const lastUpdateDate = new Date(lastUpdated);
      const now = new Date();
      const daysDiff = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24);
      
      // 如果超过30天没有更新，可以考虑清理
      if (daysDiff > 30) {
        console.log('数据超过30天未更新，可以考虑清理');
      }
    }
  } catch (error) {
    console.error('清理数据失败:', error);
  }
}

// 导出数据（用于备份）
export function exportData(): string {
  try {
    const data = {
      sessionId: getOrCreateSession(),
      characterSets: getCharacterSets(),
      lastUpdated: localStorage.getItem('last-updated'),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('导出数据失败:', error);
    return '';
  }
}

// 导入数据（用于恢复）
export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.characterSets && Array.isArray(data.characterSets)) {
      localStorage.setItem('character-sets', JSON.stringify(data.characterSets));
      localStorage.setItem('last-updated', new Date().toISOString());
      
      if (data.sessionId) {
        localStorage.setItem('user-session-id', data.sessionId);
      }
      
      console.log(`成功导入 ${data.characterSets.length} 个字库`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
}

// 获取存储统计信息
export function getStorageStats(): {
  characterSetsCount: number;
  totalCharacters: number;
  storageSize: number;
  lastUpdated: string | null;
} {
  try {
    const sets = getCharacterSets();
    const totalCharacters = sets.reduce((total, set) => total + set.characters.length, 0);
    
    // 估算存储大小（字节）
    const dataString = localStorage.getItem('character-sets') || '';
    const storageSize = new Blob([dataString]).size;
    
    return {
      characterSetsCount: sets.length,
      totalCharacters,
      storageSize,
      lastUpdated: localStorage.getItem('last-updated')
    };
  } catch (error) {
    console.error('获取存储统计失败:', error);
    return {
      characterSetsCount: 0,
      totalCharacters: 0,
      storageSize: 0,
      lastUpdated: null
    };
  }
}
