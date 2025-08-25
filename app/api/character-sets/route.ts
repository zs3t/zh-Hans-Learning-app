import { NextRequest, NextResponse } from 'next/server';

// 完全禁用SQLite，只使用localStorage
const useSQLite = false;
const databaseModule = null;

export interface CharacterSet {
  id: string;
  name: string;
  description: string;
  characters: Array<{
    char: string;
    pinyin: string[];
    strokeOrder: string[];
  }>;
}

// GET - 获取字库列表
export async function GET(request: NextRequest) {
  try {
    if (useSQLite && databaseModule) {
      // 尝试使用SQLite数据库
      const sessionId = request.headers.get('x-session-id') ||
                       request.cookies.get('session-id')?.value;

      const validSessionId = databaseModule.getOrCreateSession(sessionId);
      const characterSets = databaseModule.getCharacterSets(validSessionId);

      const response = NextResponse.json({
        success: true,
        data: characterSets,
        storage: 'sqlite'
      });

      // 设置会话ID到cookie
      response.cookies.set('session-id', validSessionId, {
        maxAge: 30 * 24 * 60 * 60, // 30天
        httpOnly: false, // 允许客户端访问
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return response;
    } else {
      // 降级到客户端localStorage处理
      return NextResponse.json({
        success: true,
        data: [], // 客户端会从localStorage加载
        storage: 'localStorage',
        message: '使用客户端localStorage存储'
      });
    }
  } catch (error) {
    console.error('获取字库失败:', error);
    return NextResponse.json({
      success: true,
      data: [], // 降级到客户端处理
      storage: 'localStorage',
      error: '服务器存储不可用，使用客户端存储'
    });
  }
}

// POST - 保存字库
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterSet } = body as { characterSet: CharacterSet };

    if (!characterSet || !characterSet.id || !characterSet.name || !characterSet.characters) {
      return NextResponse.json({
        success: false,
        error: '字库数据不完整'
      }, { status: 400 });
    }

    if (useSQLite && databaseModule) {
      // 尝试使用SQLite数据库
      const sessionId = request.headers.get('x-session-id') ||
                       request.cookies.get('session-id')?.value;

      const validSessionId = databaseModule.getOrCreateSession(sessionId);
      const success = databaseModule.saveCharacterSet(characterSet, validSessionId);

      if (success) {
        const response = NextResponse.json({
          success: true,
          message: '字库保存成功',
          storage: 'sqlite'
        });

        // 设置会话ID到cookie
        response.cookies.set('session-id', validSessionId, {
          maxAge: 30 * 24 * 60 * 60, // 30天
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        return response;
      } else {
        throw new Error('SQLite保存失败');
      }
    } else {
      // 降级到客户端localStorage处理
      return NextResponse.json({
        success: true,
        message: '请在客户端保存字库',
        storage: 'localStorage',
        characterSet: characterSet // 返回数据让客户端保存
      });
    }
  } catch (error) {
    console.error('保存字库失败:', error);
    // 降级到客户端处理
    return NextResponse.json({
      success: true,
      message: '服务器存储不可用，请在客户端保存',
      storage: 'localStorage',
      characterSet: body.characterSet // 返回数据让客户端保存
    });
  }
}
