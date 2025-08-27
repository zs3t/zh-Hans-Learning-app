'use client';

import { useEffect, useRef, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';

interface StrokeAnimationProps {
  character: string;
  size?: number;
  autoPlay?: boolean;
  speed?: number;
  loop?: boolean;
}

export default function StrokeAnimation({
  character,
  size = 240,
  autoPlay = true,
  speed = 1,
  loop = true
}: StrokeAnimationProps) {
  const writerRef = useRef<HTMLDivElement>(null);
  const hanziWriterRef = useRef<any>(null);
  const animationLoopRef = useRef<boolean>(false);

  // 隐藏灰色轮廓的函数 - 使用 useCallback 确保稳定性
  const hideGrayOutlines = useCallback(() => {
    if (writerRef.current) {
      const svg = writerRef.current.querySelector('svg');
      if (svg) {
        const paths = svg.querySelectorAll('path');
        paths.forEach(path => {
          const stroke = path.getAttribute('stroke');
          if (stroke === '#DDD' || stroke === '#ddd' || stroke === '#ccc' || stroke === '#cccccc') {
            path.style.opacity = '0';
          }
        });
      }
    }
  }, []);

  // 播放动画的函数 - 使用 useCallback 确保稳定性
  const playAnimation = useCallback(() => {
    if (!hanziWriterRef.current || !animationLoopRef.current) return;

    console.log('🎬 开始播放笔画动画');

    // 隐藏字符，重置到初始状态
    hanziWriterRef.current.hideCharacter();

    // 开始动画
    hanziWriterRef.current.animateCharacter({
      onComplete: () => {
        console.log('✅ 笔画动画完成');

        // 隐藏灰色轮廓
        setTimeout(hideGrayOutlines, 100);

        // 如果启用循环播放且循环标志仍然为 true
        if (loop && autoPlay && hanziWriterRef.current && animationLoopRef.current) {
          console.log('🔄 立即重新播放动画');
          // 使用 setTimeout 0 确保在下一个事件循环中执行，避免堆栈溢出
          setTimeout(() => {
            if (animationLoopRef.current) {
              playAnimation();
            }
          }, 0);
        }
      },
      onError: (error: any) => {
        console.error('❌ 笔画动画错误:', error);
      }
    });
  }, [loop, autoPlay, hideGrayOutlines]);

  // 初始化 HanziWriter
  useEffect(() => {
    if (!writerRef.current || !character) return;

    console.log('🔧 初始化 HanziWriter，字符:', character);

    // 停止之前的循环
    animationLoopRef.current = false;

    // 清空容器
    writerRef.current.innerHTML = '';

    try {
      // 创建新的 HanziWriter 实例
      const writer = HanziWriter.create(writerRef.current, character, {
        width: size,
        height: size,
        padding: 20,
        strokeAnimationSpeed: speed,
        delayBetweenStrokes: 300 / speed,
        showOutline: false,
        showCharacter: false,
        strokeColor: '#22c55e',
        highlightColor: '#16a34a',
        radicalColor: '#22c55e',
        drawingColor: '#22c55e'
      });

      hanziWriterRef.current = writer;
      console.log('✅ HanziWriter 创建成功');

      // 如果设置了自动播放，开始动画
      if (autoPlay) {
        console.log('🎬 启动自动播放，循环:', loop);
        animationLoopRef.current = true;
        setTimeout(() => {
          playAnimation();
        }, 300);
      } else {
        setTimeout(hideGrayOutlines, 500);
      }

    } catch (error) {
      console.error('❌ 创建HanziWriter失败:', error);

      if (writerRef.current) {
        writerRef.current.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background-color: #f9fafb;
            color: #6b7280;
            font-size: 14px;
          ">
            笔画数据加载中...
          </div>
        `;
      }
    }

    // 清理函数
    return () => {
      console.log('🧹 清理 StrokeAnimation 组件');

      // 停止循环
      animationLoopRef.current = false;

      if (hanziWriterRef.current) {
        try {
          hanziWriterRef.current.cancelAnimation();
        } catch (e) {
          console.log('清理时忽略错误:', e);
        }
        hanziWriterRef.current = null;
      }
    };
  }, [character, size, speed]);

  // 监听 autoPlay 和 loop 变化
  useEffect(() => {
    if (hanziWriterRef.current) {
      if (autoPlay && !animationLoopRef.current) {
        console.log('🔄 autoPlay 启用，开始循环播放');
        animationLoopRef.current = true;
        setTimeout(() => {
          playAnimation();
        }, 100);
      } else if (!autoPlay && animationLoopRef.current) {
        console.log('🛑 autoPlay 禁用，停止循环播放');
        animationLoopRef.current = false;
        // 取消当前动画
        try {
          hanziWriterRef.current.cancelAnimation();
        } catch (e) {
          console.log('取消动画时忽略错误:', e);
        }
      }
    }
  }, [autoPlay, loop, playAnimation]);

  return (
    <div className="hanzi-writer-container">
      <div
        ref={writerRef}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
