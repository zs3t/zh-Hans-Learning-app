import { getWordForReading } from './wordDatabase';
import { getPinyinForCharacter } from './pinyin';

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isIOS: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      this.loadVoices();

      // iOS 需要在用户交互后初始化语音
      if (this.isIOS) {
        this.initializeForIOS();
      }
    }
  }

  private initializeForIOS() {
    // 在 iOS 上，需要在用户交互事件中初始化语音合成
    const initSpeech = () => {
      if (this.synth) {
        // 播放一个静音的语音来初始化
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        this.synth.speak(utterance);
      }
    };

    // 监听用户的第一次交互
    const events = ['touchstart', 'click', 'keydown'];
    const handleFirstInteraction = () => {
      initSpeech();
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true });
    });
  }

  private loadVoices() {
    if (!this.synth) return;

    const updateVoices = () => {
      this.voices = this.synth!.getVoices().filter(voice =>
        voice.lang.includes('zh') || voice.lang.includes('cmn')
      );
    };

    updateVoices();
    this.synth.onvoiceschanged = updateVoices;
  }

  async speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }): Promise<void> {
    if (!this.synth) {
      throw new Error('语音合成不可用');
    }

    return new Promise((resolve, reject) => {
      try {
        // 停止当前播放
        this.synth!.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // 选择中文语音
        const chineseVoice = this.voices.find(voice =>
          voice.lang.includes('zh-CN') || voice.lang.includes('cmn-CN')
        );

        if (chineseVoice) {
          utterance.voice = chineseVoice;
        }

        utterance.lang = 'zh-CN';
        utterance.rate = options?.rate || 0.8;
        utterance.pitch = options?.pitch || 1;
        utterance.volume = options?.volume || 1;

        utterance.onend = () => {
          console.log('语音播放完成:', text);
          resolve();
        };

        utterance.onerror = (error) => {
          console.error('语音播放错误:', error);
          reject(error);
        };

        // iOS 特殊处理
        if (this.isIOS) {
          // 确保在用户交互的上下文中立即调用
          setTimeout(() => {
            this.synth!.speak(utterance);
          }, 0);
        } else {
          this.synth!.speak(utterance);
        }

        console.log('开始播放语音:', text);
      } catch (error) {
        console.error('语音播放失败:', error);
        reject(error);
      }
    });
  }

  /**
   * iOS 优化的语音播放方法
   * 必须在用户交互事件中直接调用
   */
  speakImmediate(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }): void {
    if (!this.synth) {
      console.warn('语音合成不可用');
      return;
    }

    try {
      // 立即停止当前播放
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // 选择中文语音
      const chineseVoice = this.voices.find(voice =>
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
        console.log('语音开始播放:', text);
      };

      utterance.onend = () => {
        console.log('语音播放完成:', text);
      };

      utterance.onerror = (error) => {
        console.error('语音播放错误:', error);
      };

      // 立即播放，不使用 setTimeout
      this.synth.speak(utterance);

      console.log('语音播放指令已发送:', text);
    } catch (error) {
      console.error('语音播放失败:', error);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  isIOSDevice(): boolean {
    return this.isIOS;
  }

  /**
   * 朗读汉字对应的词语（而不是单个汉字）
   * @param char 汉字字符
   */
  async speakCharacter(char: string): Promise<void> {
    try {
      // 获取汉字的拼音
      const pinyinResults = getPinyinForCharacter(char);

      if (pinyinResults.length > 0) {
        // 获取第一个拼音对应的词语
        const pinyin = pinyinResults[0].pinyin;
        const word = getWordForReading(char, pinyin);

        console.log(`朗读汉字 "${char}" (${pinyin}) -> 词语 "${word}"`);

        // 朗读词语而不是单个汉字
        await this.speak(word);
      } else {
        // 如果没有找到拼音，直接朗读汉字
        console.log(`朗读汉字 "${char}" (无拼音信息)`);
        await this.speak(char);
      }
    } catch (error) {
      console.error('朗读汉字失败:', error);
      // 降级到直接朗读汉字
      await this.speak(char);
    }
  }

  /**
   * iOS 优化的汉字朗读方法
   * 必须在用户交互事件中直接调用
   */
  speakCharacterImmediate(char: string): void {
    try {
      // 获取汉字的拼音
      const pinyinResults = getPinyinForCharacter(char);

      if (pinyinResults.length > 0) {
        // 获取第一个拼音对应的词语
        const pinyin = pinyinResults[0].pinyin;
        const word = getWordForReading(char, pinyin);

        console.log(`立即朗读汉字 "${char}" (${pinyin}) -> 词语 "${word}"`);

        // 朗读词语而不是单个汉字
        this.speakImmediate(word);
      } else {
        // 如果没有找到拼音，直接朗读汉字
        console.log(`立即朗读汉字 "${char}" (无拼音信息)`);
        this.speakImmediate(char);
      }
    } catch (error) {
      console.error('立即朗读汉字失败:', error);
      // 降级到直接朗读汉字
      this.speakImmediate(char);
    }
  }
}

export const speechService = new SpeechService();

// 导出便捷方法
export const speakText = (text: string, options?: {
  rate?: number;
  pitch?: number;
  volume?: number;
}) => {
  return speechService.speak(text, options);
};

export const speakCharacter = (char: string) => {
  return speechService.speakCharacter(char);
};

export const speakCharacterImmediate = (char: string) => {
  return speechService.speakCharacterImmediate(char);
};

export const stopSpeech = () => {
  speechService.stop();
};

export const isSpeechSupported = () => {
  return speechService.isSupported();
};