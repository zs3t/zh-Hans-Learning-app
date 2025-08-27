import { Howl, Howler } from 'howler';
import { getWordForReading } from './wordDatabase';
import { getPinyinForCharacter } from './pinyin';

export class HowlerSpeechService {
  private isIOS: boolean = false;
  private isInitialized: boolean = false;
  private currentHowl: Howl | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      this.initializeAudio();
    }
  }

  private initializeAudio() {
    // 监听用户的第一次交互来解锁音频上下文
    const events = ['touchstart', 'click', 'keydown', 'touchend'];
    const handleFirstInteraction = (event: Event) => {
      console.log('🎵 Howler: 检测到用户交互:', event.type);
      
      // 解锁音频上下文
      if (!this.isInitialized) {
        try {
          // Howler 会自动处理音频上下文解锁
          Howler.autoUnlock = true;
          Howler.autoSuspend = false;
          
          // 播放一个静音音频来初始化
          const initSound = new Howl({
            src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'],
            volume: 0.01,
            onload: () => {
              this.isInitialized = true;
              console.log('✅ Howler: 音频上下文已解锁');
            },
            onloaderror: (id, error) => {
              console.warn('⚠️ Howler: 初始化失败:', error);
            }
          });
          
          initSound.play();
        } catch (error) {
          console.error('❌ Howler: 初始化错误:', error);
        }
      }
      
      // 移除事件监听器
      events.forEach(eventType => {
        document.removeEventListener(eventType, handleFirstInteraction);
      });
    };

    events.forEach(eventType => {
      document.addEventListener(eventType, handleFirstInteraction, { once: true, passive: true });
    });
  }

  /**
   * 使用 Web Speech API 播放文本
   * Howler.js 主要用于解锁音频上下文，实际语音合成还是用 Web Speech API
   */
  async speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('语音合成不可用');
    }

    // 确保音频上下文已解锁
    if (!this.isInitialized && this.isIOS) {
      console.log('⚠️ 音频上下文未解锁，等待用户交互');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // 停止当前播放
        window.speechSynthesis.cancel();
        if (this.currentHowl) {
          this.currentHowl.stop();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // 获取中文语音
        const voices = window.speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice =>
          voice.lang.includes('zh-CN') || voice.lang.includes('cmn-CN')
        );

        if (chineseVoice) {
          utterance.voice = chineseVoice;
        }

        utterance.lang = 'zh-CN';
        utterance.rate = options?.rate || 0.8;
        utterance.pitch = options?.pitch || 1;
        utterance.volume = options?.volume || 1;

        utterance.onstart = () => {
          console.log('✅ Howler Speech: 语音开始播放:', text);
        };

        utterance.onend = () => {
          console.log('✅ Howler Speech: 语音播放完成:', text);
          resolve();
        };

        utterance.onerror = (error) => {
          console.error('❌ Howler Speech: 语音播放错误:', error);
          reject(error);
        };

        // 播放语音
        window.speechSynthesis.speak(utterance);
        console.log('📤 Howler Speech: 语音播放指令已发送:', text);
      } catch (error) {
        console.error('❌ Howler Speech: 语音播放失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 立即播放语音（用于用户交互事件中）
   */
  speakImmediate(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }): void {
    if (!('speechSynthesis' in window)) {
      console.warn('语音合成不可用');
      return;
    }

    try {
      console.log('🎵 Howler Speech: 准备立即播放:', text, 'iOS:', this.isIOS, '已初始化:', this.isInitialized);

      // 停止当前播放
      window.speechSynthesis.cancel();
      if (this.currentHowl) {
        this.currentHowl.stop();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // 获取中文语音
      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice =>
        voice.lang.includes('zh-CN') || voice.lang.includes('cmn-CN')
      );

      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      utterance.lang = 'zh-CN';
      utterance.rate = options?.rate || 0.8;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 1;

      utterance.onstart = () => {
        console.log('✅ Howler Speech: 立即播放开始:', text);
      };

      utterance.onend = () => {
        console.log('✅ Howler Speech: 立即播放完成:', text);
      };

      utterance.onerror = (error) => {
        console.error('❌ Howler Speech: 立即播放错误:', error);
      };

      // 立即播放
      window.speechSynthesis.speak(utterance);
      console.log('📤 Howler Speech: 立即播放指令已发送:', text);
    } catch (error) {
      console.error('❌ Howler Speech: 立即播放失败:', error);
    }
  }

  /**
   * 朗读汉字对应的词语
   */
  async speakCharacter(char: string): Promise<void> {
    try {
      const pinyinResults = getPinyinForCharacter(char);
      
      if (pinyinResults.length > 0) {
        const pinyin = pinyinResults[0].pinyin;
        const word = getWordForReading(char, pinyin);
        console.log(`Howler Speech: 朗读汉字 "${char}" (${pinyin}) -> 词语 "${word}"`);
        await this.speak(word);
      } else {
        console.log(`Howler Speech: 朗读汉字 "${char}" (无拼音信息)`);
        await this.speak(char);
      }
    } catch (error) {
      console.error('Howler Speech: 朗读汉字失败:', error);
      await this.speak(char);
    }
  }

  /**
   * 立即朗读汉字
   */
  speakCharacterImmediate(char: string): void {
    try {
      const pinyinResults = getPinyinForCharacter(char);
      
      if (pinyinResults.length > 0) {
        const pinyin = pinyinResults[0].pinyin;
        const word = getWordForReading(char, pinyin);
        console.log(`Howler Speech: 立即朗读汉字 "${char}" (${pinyin}) -> 词语 "${word}"`);
        this.speakImmediate(word);
      } else {
        console.log(`Howler Speech: 立即朗读汉字 "${char}" (无拼音信息)`);
        this.speakImmediate(char);
      }
    } catch (error) {
      console.error('Howler Speech: 立即朗读汉字失败:', error);
      this.speakImmediate(char);
    }
  }

  stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentHowl) {
      this.currentHowl.stop();
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  isIOSDevice(): boolean {
    return this.isIOS;
  }

  isAudioUnlocked(): boolean {
    return this.isInitialized;
  }
}

// 创建实例
export const howlerSpeechService = new HowlerSpeechService();

// 导出便捷方法
export const speakTextWithHowler = (text: string, options?: {
  rate?: number;
  pitch?: number;
  volume?: number;
}) => {
  return howlerSpeechService.speak(text, options);
};

export const speakCharacterWithHowler = (char: string) => {
  return howlerSpeechService.speakCharacter(char);
};

export const speakCharacterImmediateWithHowler = (char: string) => {
  return howlerSpeechService.speakCharacterImmediate(char);
};

export const stopSpeechWithHowler = () => {
  howlerSpeechService.stop();
};
