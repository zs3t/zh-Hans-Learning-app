// components/StrokeAnimation.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import type { HanziWriterInstance } from '../lib/types';


export function StrokeAnimation({ character, size = 240, autoPlay = true, speed = 1, loop = true }: {
  character: string;
  size?: number;
  autoPlay?: boolean;
  speed?: number;
  loop?: boolean;
}) {
  const writerRef = useRef<HTMLDivElement>(null);
  const hanziWriterRef = useRef<HanziWriterInstance | null>(null);
  const animationActiveRef = useRef<boolean>(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupWriter = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (writerRef.current) {
        writerRef.current.innerHTML = '';
    }
    hanziWriterRef.current = null;
    animationActiveRef.current = false;
  }, []);

  const playAnimation = useCallback(() => {
    if (!hanziWriterRef.current || animationActiveRef.current) return;

    animationActiveRef.current = true;
    hanziWriterRef.current.animateCharacter({
      onComplete: () => {
        animationActiveRef.current = false;
        if (loop) {
          const delay = (hanziWriterRef.current as any)?._options?.delayBetweenLoops || 2000;
          animationTimeoutRef.current = setTimeout(() => {
            if (hanziWriterRef.current) {
              playAnimation();
            }
          }, delay);
        }
      }
    });
  }, [loop]);

  useEffect(() => {
    cleanupWriter(); // 清理旧的 writer 实例和计时器

    if (!writerRef.current || !character) {
        // 如果没有 ref 或没有字符，则不创建 writer
      return;
    }

    const createWriterInstance = () => {
      try {
        // 确保 size 不为 0 或负数，以免 HanziWriter 报错
        const effectiveSize = Math.max(1, size); 

        const writer = HanziWriter.create(writerRef.current!, character, {
          width: effectiveSize,
          height: effectiveSize,
          // **** 核心修改 1: 将 padding 明确设置为 0 ****
          // 这会强制 HanziWriter 动画完全填充它所给定的 size 区域，不加任何内部空白。
          padding: 0, 
          strokeAnimationSpeed: speed,
          delayBetweenStrokes: 300,
          drawingWidth: 5, // 笔画宽度，这个值在 HanziWriter 内部的 1024 坐标系下
          drawingColor: '#09f660',
          strokeColor: '#09f660',
          // **** 核心修改 2: 减小 outlineWidth ****
          // 减小轮廓线宽度，降低在小尺寸时视觉溢出的风险。1px 是一个安全的默认值。
          outlineWidth: 1, 
          outlineColor: '#DAFCEB', // 浅绿色，如果你想隐藏这个“灰色边框”，可以设置为透明'transparent'或与背景色一致
          showOutline: true,
          showCharacter: true,

          charDataLoader: (char: string, onComplete: (data: any) => void) => {
            fetch(`/hanzi-data/${char}.json`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to load character data for ${char}`);
                }
                return response.json();
              })
              .then(data => {
                onComplete(data);
              })
              .catch(error => {
                console.error(`HanziWriter data load error for '${char}': ${error.message}`);
                // 如果数据加载失败，显示错误消息
                if (writerRef.current) {
                  writerRef.current.innerHTML = `<p style="font-size:14px; color:red; text-align:center;">字形数据'${char}'加载失败</p>`;
                }
              });
          },
        });

        hanziWriterRef.current = writer as HanziWriterInstance;

        if (autoPlay) {
          playAnimation();
        }

      } catch (error) {
        console.error('Failed to create HanziWriter instance:', error);
      }
    };

    // 延迟创建实例，确保DOM完全准备好
    const timeoutId = setTimeout(createWriterInstance, 100); 

    return () => {
      clearTimeout(timeoutId);
      cleanupWriter();
    };
  }, [character, size, autoPlay, speed, loop, cleanupWriter, playAnimation]);

  return (
    <div className="hanzi-writer-container" style={{ width: size, height: size, overflow: 'hidden' }}>
      <div
        ref={writerRef}
        // 确保这个 div 填充其父容器并隐藏溢出
        style={{
          width: '100%', 
          height: '100%',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
    </div>
  );
}
