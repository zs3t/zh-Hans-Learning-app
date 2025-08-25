'use client';

import { useEffect, useRef, useState } from 'react';

interface SimpleStrokeAnimationProps {
  character: string;
  size?: number;
  autoPlay?: boolean;
  speed?: number;
}

export default function SimpleStrokeAnimation({ 
  character, 
  size = 240, 
  autoPlay = true, 
  speed = 1 
}: SimpleStrokeAnimationProps) {
  const writerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!writerRef.current || !character) {
      console.log('SimpleStrokeAnimation: 容器或字符为空');
      return;
    }

    console.log(`SimpleStrokeAnimation: 开始加载 "${character}"`);
    setStatus('loading');

    // 清空容器
    writerRef.current.innerHTML = '';

    // 动态导入并创建HanziWriter
    const initHanziWriter = async () => {
      try {
        console.log('SimpleStrokeAnimation: 正在导入HanziWriter...');
        
        // 动态导入HanziWriter
        const HanziWriterModule = await import('hanzi-writer');
        const HanziWriter = HanziWriterModule.default || HanziWriterModule;
        
        console.log('SimpleStrokeAnimation: HanziWriter导入成功');

        if (!writerRef.current) {
          throw new Error('容器已被销毁');
        }

        console.log('SimpleStrokeAnimation: 正在创建Writer实例...');

        // 创建HanziWriter实例
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

        console.log('SimpleStrokeAnimation: Writer实例创建成功');

        // 等待一下再开始动画
        setTimeout(() => {
          if (autoPlay && writer) {
            console.log('SimpleStrokeAnimation: 开始播放动画');
            writer.animateCharacter({
              onComplete: () => {
                console.log('SimpleStrokeAnimation: 动画播放完成');
                setStatus('success');
              }
            });
          } else {
            setStatus('success');
          }
        }, 100);

      } catch (error) {
        console.error('SimpleStrokeAnimation: 创建失败', error);
        const message = error instanceof Error ? error.message : '未知错误';
        setErrorMessage(message);
        setStatus('error');
        
        // 显示错误信息
        if (writerRef.current) {
          writerRef.current.innerHTML = `
            <div style="
              width: ${size}px;
              height: ${size}px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background-color: #fef2f2;
              color: #ef4444;
              font-size: 14px;
              text-align: center;
              padding: 20px;
              box-sizing: border-box;
            ">
              <div>❌ 笔画加载失败</div>
              <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">
                ${message}
              </div>
            </div>
          `;
        }
      }
    };

    initHanziWriter();

  }, [character, size, autoPlay, speed]);

  // 如果正在加载，显示加载状态
  if (status === 'loading') {
    return (
      <div className="hanzi-writer-container">
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
            color: '#6b7280',
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div>⏳ 正在加载笔画数据...</div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            字符: {character}
          </div>
        </div>
      </div>
    );
  }

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
