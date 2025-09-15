// components/AudioUnlocker.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// 一个极短的、无声的 base64 编码的音频文件。
// 这样做可以避免依赖外部文件，保证它永远不会加载失败。
const SILENT_AUDIO_BASE64 = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMHumPYA/sAEAAAAACAAADSAAQAAAAgAAAZgCoECOAABAwHGIAlAADIjVQUEAxwBlgAABAAAAgAAAAJAAAACwAAAAgAAAGdAAAGwAAAlYABgc4AAAH0AAB1wAAA9gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AAAAAAAADwAABpAAAAAAAAQwAAA4QAAAc5AAAA0gAAAAAAAAABAAAOxwAABAIAAAAQAAAaQAAAAwAAAGsAAAAAAAAAhwAAAAEAAAAUAACAAAAAAAAADgAAMgAAAAB3AAAAAAAAAP//AAAAAAAEBgAAAEgAAAABAAAABQAUAAAAAAAADgAAMgAAAAB3AAAAAAAAAP//AAAAAAAEBgAAAEgAAAABAAAABQAUAAAAAAAADgAAMgAAAAB3AAAAAAAAAP//AAAAAAEAAAgAAAAFAQAAAAEAAAgAAAAFAQAAAAEAAAgAAAAFAQAAAAEAAAgAAAAFAQAAAAEAAAgAAAAFAQAAAAEAAAgAAAAFAQAAAAEAAAgAAAAFAQAAAAEAAAgAAAAFAQAAAAAAAAAAB/8AAAABCAAADSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFA==';

/**
 * 一个无形的组件，用于在用户首次与页面交互时解锁浏览器的音频上下文。
 * 解决了“自动播放策略”导致音频无法播放的问题。
 *
 * 用法: 在你的主布局文件 (e.g., app/layout.tsx) 中包裹你的子组件。
 * <AudioUnlocker>
 *   {children}
 * </AudioUnlocker>
 */
const AudioUnlocker: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 使用 useCallback 确保函数引用稳定，避免在 effect 中不必要的重绑。
  const unlockAudio = useCallback(() => {
    // 如果已经解锁，或 audio 元素不存在，则不执行任何操作。
    if (isUnlocked || !audioRef.current) {
      return;
    }

    // 尝试播放无声文件来“唤醒”音频功能。
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // 播放成功，说明音频已解锁。
          console.log('🔊 Audio context unlocked successfully.');
          setIsUnlocked(true);
        })
        .catch(error => {
          // 播放失败，通常是因为用户还没与页面交互，这没关系，下次交互会再试。
          console.warn('Audio unlock attempt failed, will retry on next interaction.', error.name);
        });
    }
  }, [isUnlocked]); // 依赖项是 isUnlocked 状态。

  useEffect(() => {
    // 步骤1: 仅在组件首次挂载时创建一次 audio 元素实例。
    if (!audioRef.current) {
        const audio = new Audio(SILENT_AUDIO_BASE64);
        audio.loop = false;
        audio.playsInline = true; // 对移动设备友好
        audioRef.current = audio;
    }
    
    // 步骤2: 添加一次性事件监听器，捕捉用户的首次交互。
    // { once: true } 选项确保监听器在触发一次后自动移除。
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once:true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    // 步骤3: 组件卸载时进行清理。
    return () => {
      // 尽管 `once: true` 会自动移除监听器，但手动移除是更保险的做法。
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      
      if (audioRef.current) {
          audioRef.current.pause(); // 停止任何可能的播放
          audioRef.current = null;  // 释放引用
      }
    };
  }, [unlockAudio]); // effect 的依赖是稳定的 unlockAudio 函数。

  // 默认情况下，我们渲染子组件。这个组件是无形的。
  // 在你的代码里，你可能只是返回 null。但为了通用性，我将它设计成一个包裹器。
  // 如果你原来的组件是返回 null，那么我们也这样做。

  /*
   * 检查你原先的 AudioUnlocker 是如何被使用的。
   * 如果它是这样用的：
   * <main>
   *   <AudioUnlocker /> 
   *   <MainDisplay ... />
   * </main>
   * 那么就使用下面的 return null;
   *
   * 如果是这样用的：
   * <AudioUnlocker>
   *   <main>
   *     <MainDisplay ... />
   *   </main>
   * </AudioUnlocker>
   * 那么就使用 return <>{children}</>;
   */

  // 根据你原始代码的实现，它是一个独立的、不渲染任何内容的组件。
  // 所以我们返回 null。
  return null;
};

// 如果你的组件被用作包裹器，请取消下面这行的注释，并注释掉上面的 return null;
// const AudioUnlockerWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   // ... (上面所有的 hooks 和逻辑) ...
//   return <>{children}</>;
// };


export default AudioUnlocker;
