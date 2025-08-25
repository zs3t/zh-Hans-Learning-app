import Database from 'better-sqlite3';
import path from 'path';

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'character_sets.db');

// 确保数据目录存在
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    
    // 创建字库表
    db.exec(`
      CREATE TABLE IF NOT EXISTS character_sets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        characters TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建用户会话表（用于跟踪不同设备）
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        session_id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建字库与会话的关联表
    db.exec(`
      CREATE TABLE IF NOT EXISTS session_character_sets (
        session_id TEXT,
        character_set_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES user_sessions(session_id),
        FOREIGN KEY (character_set_id) REFERENCES character_sets(id),
        PRIMARY KEY (session_id, character_set_id)
      )
    `);
  }
  
  return db;
}

export interface CharacterSetDB {
  id: string;
  name: string;
  description: string;
  characters: string; // JSON string
  created_at: string;
  updated_at: string;
}

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

// 获取或创建会话ID
export function getOrCreateSession(sessionId?: string): string {
  const db = getDatabase();
  
  if (sessionId) {
    // 检查会话是否存在
    const session = db.prepare('SELECT session_id FROM user_sessions WHERE session_id = ?').get(sessionId);
    if (session) {
      // 更新最后访问时间
      db.prepare('UPDATE user_sessions SET last_accessed = CURRENT_TIMESTAMP WHERE session_id = ?').run(sessionId);
      return sessionId;
    }
  }
  
  // 创建新会话
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  db.prepare('INSERT INTO user_sessions (session_id) VALUES (?)').run(newSessionId);
  
  return newSessionId;
}

// 保存字库到数据库
export function saveCharacterSet(characterSet: CharacterSet, sessionId: string): boolean {
  try {
    const db = getDatabase();
    
    // 保存字库
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO character_sets (id, name, description, characters, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      characterSet.id,
      characterSet.name,
      characterSet.description,
      JSON.stringify(characterSet.characters)
    );
    
    // 关联字库到会话
    const linkStmt = db.prepare(`
      INSERT OR IGNORE INTO session_character_sets (session_id, character_set_id)
      VALUES (?, ?)
    `);
    
    linkStmt.run(sessionId, characterSet.id);
    
    return true;
  } catch (error) {
    console.error('保存字库失败:', error);
    return false;
  }
}

// 获取会话的所有字库
export function getCharacterSets(sessionId: string): CharacterSet[] {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT cs.* FROM character_sets cs
      JOIN session_character_sets scs ON cs.id = scs.character_set_id
      WHERE scs.session_id = ?
      ORDER BY cs.created_at DESC
    `);
    
    const rows = stmt.all(sessionId) as CharacterSetDB[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      characters: JSON.parse(row.characters)
    }));
  } catch (error) {
    console.error('获取字库失败:', error);
    return [];
  }
}

// 删除字库
export function deleteCharacterSet(characterSetId: string, sessionId: string): boolean {
  try {
    const db = getDatabase();
    
    // 删除会话关联
    db.prepare('DELETE FROM session_character_sets WHERE session_id = ? AND character_set_id = ?')
      .run(sessionId, characterSetId);
    
    // 检查是否还有其他会话使用这个字库
    const otherSessions = db.prepare('SELECT COUNT(*) as count FROM session_character_sets WHERE character_set_id = ?')
      .get(characterSetId) as { count: number };
    
    // 如果没有其他会话使用，删除字库本身
    if (otherSessions.count === 0) {
      db.prepare('DELETE FROM character_sets WHERE id = ?').run(characterSetId);
    }
    
    return true;
  } catch (error) {
    console.error('删除字库失败:', error);
    return false;
  }
}

// 清理过期会话（超过30天未访问）
export function cleanupExpiredSessions(): void {
  try {
    const db = getDatabase();
    
    // 删除过期会话的关联
    db.prepare(`
      DELETE FROM session_character_sets 
      WHERE session_id IN (
        SELECT session_id FROM user_sessions 
        WHERE last_accessed < datetime('now', '-30 days')
      )
    `).run();
    
    // 删除过期会话
    db.prepare(`
      DELETE FROM user_sessions 
      WHERE last_accessed < datetime('now', '-30 days')
    `).run();
    
    // 删除没有关联会话的字库
    db.prepare(`
      DELETE FROM character_sets 
      WHERE id NOT IN (
        SELECT DISTINCT character_set_id FROM session_character_sets
      )
    `).run();
  } catch (error) {
    console.error('清理过期会话失败:', error);
  }
}
