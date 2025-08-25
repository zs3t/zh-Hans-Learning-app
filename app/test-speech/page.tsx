'use client';

import { useState } from 'react';
import { IOSSpeechFix } from '../../lib/iosSpeechFix';

export default function TestSpeechPage() {
  const [testText, setTestText] = useState('你好');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      await IOSSpeechFix.speak(testText);
    } catch (error) {
      console.error('语音播放失败:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSpeakSync = () => {
    IOSSpeechFix.speakSync(testText);
  };

  const handleStop = () => {
    IOSSpeechFix.stop();
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">语音播放测试</h1>
        
        <div className="space-y-6">
          {/* 设备信息 */}
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">设备信息</h2>
            <p>iOS 设备: {IOSSpeechFix.isIOSDevice() ? '是' : '否'}</p>
            <p>语音支持: {IOSSpeechFix.isSupported() ? '是' : '否'}</p>
            <p>用户代理: {typeof window !== 'undefined' ? navigator.userAgent : '未知'}</p>
          </div>

          {/* 测试文本输入 */}
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">测试文本</h2>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="输入要播放的文本"
            />
          </div>

          {/* 测试按钮 */}
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">测试按钮</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSpeak}
                disabled={isPlaying}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isPlaying ? '播放中...' : '异步播放'}
              </button>
              
              <button
                onClick={handleSpeakSync}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                同步播放
              </button>
              
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                停止播放
              </button>
            </div>
          </div>

          {/* 预设测试文本 */}
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">快速测试</h2>
            <div className="grid grid-cols-2 gap-2">
              {['你好', '中文', '测试', '语音', '播放', '苹果', '手机', '浏览器'].map((text) => (
                <button
                  key={text}
                  onClick={() => {
                    setTestText(text);
                    IOSSpeechFix.speakSync(text);
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  🔊 {text}
                </button>
              ))}
            </div>
          </div>

          {/* 使用说明 */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-semibold mb-2 text-yellow-800">使用说明</h2>
            <ul className="text-yellow-700 space-y-1">
              <li>• 在 iOS 设备上，首次点击可能需要用户交互来激活语音</li>
              <li>• 如果没有声音，请检查设备音量和静音开关</li>
              <li>• 建议使用"同步播放"按钮进行测试</li>
              <li>• 打开浏览器的开发者工具查看详细日志</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
