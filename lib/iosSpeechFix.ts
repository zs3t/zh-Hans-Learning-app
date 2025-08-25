/**
 * iOS 语音播放修复工具
 * 解决 iOS Safari/Chrome 语音播放问题
 */

export class IOSSpeechFix {
  private static isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  private static isInitialized = false;

  /**
   * 初始化 iOS 语音支持
   * 必须在用户交互事件中调用
   */
  static initialize(): void {
    if (!this.isIOS || this.isInitialized) return;

    try {
      // 播放一个静音语音来激活语音合成
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
      
      this.isInitialized = true;
      console.log('🔊 iOS 语音合成已初始化');
    } catch (error) {
      console.error('🔊 iOS 语音初始化失败:', error);
    }
  }

  /**
   * iOS 优化的语音播放
   * @param text 要播放的文本
   * @param options 播放选项
   */
  static speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('语音合成不支持'));
        return;
      }

      try {
        // 如果是 iOS 且未初始化，先初始化
        if (this.isIOS && !this.isInitialized) {
          this.initialize();
        }

        // 停止当前播放
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options?.lang || 'zh-CN';
        utterance.rate = options?.rate || 0.8;
        utterance.pitch = options?.pitch || 1;
        utterance.volume = options?.volume || 1;

        // 选择中文语音
        const voices = speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice =>
          voice.lang.includes('zh') || voice.lang.includes('CN')
        );
        if (chineseVoice) {
          utterance.voice = chineseVoice;
        }

        let hasStarted = false;
        let timeoutId: any;

        utterance.onstart = () => {
          hasStarted = true;
          console.log('🔊 语音开始播放:', text);
          if (timeoutId) clearTimeout(timeoutId);
        };

        utterance.onend = () => {
          console.log('🔊 语音播放完成:', text);
          if (timeoutId) clearTimeout(timeoutId);
          resolve();
        };

        utterance.onerror = (error) => {
          console.error('🔊 语音播放错误:', error);
          if (timeoutId) clearTimeout(timeoutId);
          
          // iOS 错误重试
          if (this.isIOS && !hasStarted) {
            console.log('🔊 iOS 重试播放');
            setTimeout(() => {
              speechSynthesis.cancel();
              speechSynthesis.speak(utterance);
            }, 100);
          } else {
            reject(error);
          }
        };

        // 立即播放
        speechSynthesis.speak(utterance);

        // iOS 特殊处理：检查播放状态
        if (this.isIOS) {
          timeoutId = setTimeout(() => {
            if (!hasStarted && !speechSynthesis.speaking && !speechSynthesis.pending) {
              console.log('🔊 iOS 播放超时，重试');
              speechSynthesis.cancel();
              speechSynthesis.speak(utterance);
            }
          }, 200);
        }

      } catch (error) {
        console.error('🔊 语音播放失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 同步播放方法（用于事件处理器中）
   */
  static speakSync(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
  }): void {
    if (!('speechSynthesis' in window)) {
      console.warn('语音合成不支持');
      return;
    }

    try {
      // iOS 初始化
      if (this.isIOS && !this.isInitialized) {
        this.initialize();
      }

      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || 'zh-CN';
      utterance.rate = options?.rate || 0.8;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 1;

      // 选择中文语音
      const voices = speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice =>
        voice.lang.includes('zh') || voice.lang.includes('CN')
      );
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      utterance.onstart = () => console.log('🔊 语音开始播放:', text);
      utterance.onend = () => console.log('🔊 语音播放完成:', text);
      utterance.onerror = (error) => console.error('🔊 语音播放错误:', error);

      speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('🔊 同步语音播放失败:', error);
    }
  }

  /**
   * 停止语音播放
   */
  static stop(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * 检查是否为 iOS 设备
   */
  static isIOSDevice(): boolean {
    return this.isIOS;
  }

  /**
   * 检查语音合成是否支持
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

// 自动在用户首次交互时初始化
if (typeof window !== 'undefined' && IOSSpeechFix.isIOSDevice()) {
  const events = ['touchstart', 'click', 'keydown'];
  const handleFirstInteraction = () => {
    IOSSpeechFix.initialize();
    events.forEach(event => {
      document.removeEventListener(event, handleFirstInteraction);
    });
  };

  events.forEach(event => {
    document.addEventListener(event, handleFirstInteraction, { once: true });
  });
}
