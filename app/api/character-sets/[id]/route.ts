import { NextRequest, NextResponse } from 'next/server';

// DELETE - 删除字库（使用localStorage）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const characterSetId = params.id;

    if (!characterSetId) {
      return NextResponse.json({
        success: false,
        error: '字库ID不能为空'
      }, { status: 400 });
    }

    // 返回成功，让客户端处理删除
    return NextResponse.json({
      success: true,
      message: '请在客户端删除字库',
      storage: 'localStorage',
      characterSetId: characterSetId
    });
  } catch (error) {
    console.error('删除字库失败:', error);
    return NextResponse.json({
      success: true,
      message: '请在客户端删除字库',
      storage: 'localStorage',
      characterSetId: params.id
    });
  }
}
