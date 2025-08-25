'use client';

import { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface StrokeAnimationProps {
  character: string;
  size?: number;
  autoPlay?: boolean;
  speed?: number;
}

export default function StrokeAnimation({ 
  character, 
  size = 240, 
  autoPlay = true, 
  speed = 1 
}: StrokeAnimationProps) {
  const writerRef = useRef<HTMLDivElement>(null);
  const hanziWriterRef = useRef<any>(null);

  useEffect(() => {
    if (!writerRef.current || !character) return;

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
        showOutline: false, // 不显示灰色轮廓
        showCharacter: false, // 不显示完整汉字
        strokeColor: '#22c55e', // 绿色笔画
        highlightColor: '#16a34a', // 深绿色高亮
        radicalColor: '#22c55e',
        drawingColor: '#22c55e' // 绘制颜色也设为绿色
      });

      hanziWriterRef.current = writer;

      // 温和地隐藏灰色轮廓的函数
      const hideGrayOutlines = () => {
        if (writerRef.current) {
          const svg = writerRef.current.querySelector('svg');
          if (svg) {
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
              const stroke = path.getAttribute('stroke');
              
              // 只隐藏明确的灰色轮廓，保留所有其他元素
              if (stroke === '#DDD' || stroke === '#ddd' || stroke === '#ccc' || stroke === '#cccccc') {
                path.style.opacity = '0';
              }
            });
          }
        }
      };

      // 如果设置了自动播放，开始动画
      if (autoPlay) {
        writer.animateCharacter({
          onComplete: () => {
            // 动画完成后隐藏灰色轮廓
            setTimeout(hideGrayOutlines, 100);
          }
        });
      } else {
        // 如果不自动播放，也要隐藏灰色轮廓
        setTimeout(hideGrayOutlines, 500);
      }

    } catch (error) {
      console.error('创建HanziWriter失败:', error);
      
      // 显示错误信息
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
      if (hanziWriterRef.current) {
        try {
          hanziWriterRef.current.cancelAnimation();
        } catch (e) {
          // 忽略清理错误
        }
        hanziWriterRef.current = null;
      }
    };
  }, [character, size, autoPlay, speed]);

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
