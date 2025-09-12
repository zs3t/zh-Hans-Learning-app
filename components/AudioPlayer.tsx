// components/AudioPlayer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

// 定义组件接收的属性
interface AudioPlayerProps {
  pinyin: string; // 直接接收带声调的拼音, e.g., "hǎo"
}

export function AudioPlayer({ pinyin }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (isPlaying || !pinyin) return;

    try {
      // ✨ 核心简化：文件名就是拼音本身！
      const audioUrl = `/audio/${pinyin}.m4a`;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        console.error(`无法加载或播放音频: ${audioUrl}. 请确认文件存在于 public/audio/ 目录中。`);
        setIsPlaying(false);
        // 这里可以加一个 toast 提示用户文件丢失
      };
      
      audio.play();

    } catch (error) {
        console.error("播放音频时发生未知错误:", error);
        setIsPlaying(false);
    }
  };
  
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 样式和之前保持一致
  return (
    <button
      onClick={playSound}
      disabled={isPlaying || !pinyin}
      className={`flex items-center justify-center w-8 h-8 text-white rounded-md transition-colors duration-200 ${
        isPlaying
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-700 hover:bg-green-800 cursor-pointer'
      }`}
      title={isPlaying ? '正在播放...' : `播放 ${pinyin}`}
    >
      {isPlaying ? '▶️' : '🔊'}
    </button>
  );
}
