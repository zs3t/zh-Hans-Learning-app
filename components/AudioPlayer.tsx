'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  text: string;
  className?: string;
  size?: 'sm' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showText?: boolean;
  disabled?: boolean;
}

export default function AudioPlayer({ 
  text, 
  className = '',
  size = 'sm',
  variant = 'ghost',
  showText = false,
  disabled = false
}: AudioPlayerProps) {
  // 使用 useRef 来获取 audio 元素的 DOM 引用
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // 检查浏览器支持和初始化
  useEffect(() => {
    // 检查是否支持 Web Speech API 或 Audio API
    const speechSupported = 'speechSynthesis' in window;
    const audioSupported = 'Audio' in window;
    
    setIsSupported(speechSupported || audioSupported);

    // 如果支持 Web Speech API，生成音频 URL
    if (speechSupported && text) {
      generateAudioUrl();
    }
  }, [text]);

  // 生成音频 URL（使用 Web Speech API）
  const generateAudioUrl = () => {
    try {
      // 创建语音合成实例
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      // 选择中文语音
      const voices = speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice =>
        voice.lang.includes('zh') || voice.lang.includes('CN')
      );
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      // 注意：这里我们不直接播放，而是准备好语音合成器
      // 实际播放将在用户点击时进行
    } catch (error) {
      console.error('语音合成准备失败:', error);
    }
  };

  // 处理播放按钮点击 - 关键：这个函数直接绑定到用户交互事件
  const handlePlay = () => {
    if (!isSupported || disabled || isPlaying) return;

    setIsPlaying(true);

    try {
      // 方法1：使用 Web Speech API（推荐用于中文）
      if ('speechSynthesis' in window) {
        // 停止当前播放
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;

        // 选择中文语音
        const voices = speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice =>
          voice.lang.includes('zh') || voice.lang.includes('CN')
        );
        if (chineseVoice) {
          utterance.voice = chineseVoice;
        }

        utterance.onstart = () => {
          console.log("🔊 语音开始播放:", text);
        };

        utterance.onend = () => {
          console.log("🔊 语音播放完成:", text);
          setIsPlaying(false);
        };

        utterance.onerror = (error) => {
          console.error("🔊 语音播放失败:", error);
          setIsPlaying(false);
          
          // 如果 Speech API 失败，尝试使用 Audio API
          fallbackToAudio();
        };

        // 关键：play() 方法在用户交互事件中被调用
        speechSynthesis.speak(utterance);

      } else {
        // 方法2：使用 Audio API 作为后备
        fallbackToAudio();
      }

    } catch (error) {
      console.error('音频播放失败:', error);
      setIsPlaying(false);
    }
  };

  // 后备音频播放方法
  const fallbackToAudio = () => {
    if (audioRef.current) {
      // 如果有预设的音频文件，使用 Audio API
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(_ => {
            console.log("🔊 音频开始播放");
          })
          .catch(error => {
            console.error("🔊 音频播放失败:", error);
            setIsPlaying(false);
          });
      }
    } else {
      // 如果没有音频文件，显示提示
      console.warn('音频播放不可用');
      setIsPlaying(false);
    }
  };

  // 停止播放
  const handleStop = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // 获取按钮尺寸
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8 p-0';
      case 'lg': return 'h-12 w-12 p-0';
      default: return 'h-8 w-8 p-0';
    }
  };

  // 获取图标尺寸
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-6 w-6';
      default: return 'h-4 w-4';
    }
  };

  if (!isSupported) {
    return null; // 不支持音频播放时不显示按钮
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showText && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
      
      {/* 关键：将 play() 操作放在 onClick 事件中 */}
      <Button
        size={size}
        variant={variant}
        onClick={isPlaying ? handleStop : handlePlay}
        disabled={disabled}
        className={`${getButtonSize()} hover:bg-accent/20`}
        title={isPlaying ? '停止播放' : `播放 "${text}"`}
      >
        {isPlaying ? (
          <VolumeX className={`${getIconSize()} text-accent`} />
        ) : (
          <Volume2 className={`${getIconSize()} text-accent`} />
        )}
      </Button>
      
      {/* 隐藏的 audio 元素，用作后备方案 */}
      <audio 
        ref={audioRef} 
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </div>
  );
}
