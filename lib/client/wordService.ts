// lib/client/wordService.ts
import { CharacterSet, Character, SimpleCharacterSet } from '../types';

interface ImportResponse {
  message: string;
  characterSet?: CharacterSet;
}

export const wordService = {
  async getAllCharacterSets(): Promise<SimpleCharacterSet[]> {
    const res = await fetch('/api/characters');
    if (!res.ok) {
      throw new Error('Failed to fetch character sets');
    }
    const data = await res.json();
    return data;
  },

  async getCharacterSetById(setId: string): Promise<CharacterSet | null> {
    const res = await fetch(`/api/characters/${setId}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch character set by ID');
    }
    const data = await res.json();
    // 将 coma string 转换为数组
    data.characters = data.characters.map((c: any) => ({
      ...c,
      pinyin: c.pinyin ? c.pinyin.split(',') : []
    }));
    return data;
  },

  async addCharacterSet(name: string, description: string, characters: string[]): Promise<ImportResponse> {
    const res = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, characters }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add character set');
    }
    // 将 coma string 转换为数组
    if (data.characterSet && data.characterSet.characters) {
      data.characterSet.characters = data.characterSet.characters.map((c: any) => ({
        ...c,
        pinyin: c.pinyin ? c.pinyin.split(',') : []
      }));
    }
    return data;
  },

  async deleteCharacterSet(setId: string): Promise<void> {
    const res = await fetch(`/api/characters/${setId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete character set');
    }
    return;
  },

  async updateCharacterPinyin(charId: string, pinyin: string[]): Promise<Character> {
    const res = await fetch(`/api/characters/character/${charId}/pinyin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinyin }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update character pinyin');
    }
    // 将 coma string 转换为数组
    data.pinyin = data.pinyin ? data.pinyin.split(',') : [];
    return data;
  }
};
