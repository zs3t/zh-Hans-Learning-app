'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, Eye, SkipForward, ArrowLeft } from "lucide-react";
import dynamic from 'next/dynamic';
import { IOSSpeechFix } from '../../../lib/iosSpeechFix';
import { getPinyinForCharacter } from '../../../lib/pinyin';

// 动态导入StrokeAnimation组件
const StrokeAnimation = dynamic(() => import('../../../components/StrokeAnimation'), {
  ssr: false,
  loading: () => <div className="w-64 h-64 bg-gray-100 rounded-lg animate-pulse"></div>
});

interface Character {
  char: string;
  pinyin: string[];
}

interface CharacterSet {
  id: string;
  name: string;
  description: string;
  characters: Character[];
}

// 示例字库数据
const sampleCharacterSets: CharacterSet[] = [
  {
    id: "basic",
    name: "基础汉字",
    description: "常用基础汉字",
    characters: [
      { char: "你", pinyin: [] },
      { char: "好", pinyin: [] },
      { char: "我", pinyin: [] },
      { char: "是", pinyin: [] },
      { char: "中", pinyin: [] },
      { char: "国", pinyin: [] },
      { char: "人", pinyin: [] },
      { char: "学", pinyin: [] },
      { char: "习", pinyin: [] },
      { char: "汉", pinyin: [] },
      { char: "字", pinyin: [] },
    ]
  }
];

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.id as string;

  const [characterSet, setCharacterSet] = useState<CharacterSet | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStrokes, setShowStrokes] = useState(false);
  const [pinyin, setPinyin] = useState<string[]>([]);

  // 文字转语音功能
  const speakPinyin = (pinyinText: string) => {
    if (currentCharacter && IOSSpeechFix.isSupported()) {
      // 使用 iOS 优化的语音播放
      IOSSpeechFix.speakSync(currentCharacter.char, {
        rate: 0.8,
        pitch: 1,
        volume: 1,
        lang: 'zh-CN'
      });
    } else {
      console.warn('语音合成不支持或没有当前字符');
    }
  };

  // 获取随机汉字
  const getRandomCharacter = () => {
    if (!characterSet || characterSet.characters.length === 0) return;

    const randomIndex = Math.floor(Math.random() * characterSet.characters.length);
    const character = characterSet.characters[randomIndex];

    setCurrentCharacter(character);
    setShowStrokes(false);
    // 自动获取并显示拼音
    loadPinyin(character.char);
  };

  // 加载拼音
  const loadPinyin = (character: string) => {
    try {
      const pinyinResults = getPinyinForCharacter(character);
      const pinyinStrings = pinyinResults.map(result => result.pinyin);
      setPinyin(pinyinStrings);
    } catch (error) {
      console.error('获取拼音失败:', error);
      setPinyin([]);
    }
  };

  // 切换笔画显示
  const toggleStrokes = () => {
    setShowStrokes(!showStrokes);
  };

  // 加载字库信息
  const loadCharacterSet = () => {
    // 从本地存储加载自定义字库
    try {
      const saved = localStorage.getItem('customCharacterSets');
      let allSets = [...sampleCharacterSets];

      if (saved) {
        const customSets = JSON.parse(saved);
        allSets = [...allSets, ...customSets];
      }

      const set = allSets.find((s: CharacterSet) => s.id === setId);
      setCharacterSet(set || null);
    } catch (error) {
      console.error('加载字库信息失败:', error);
      setCharacterSet(null);
    }
  };

  // 初始化
  useEffect(() => {
    if (setId) {
      loadCharacterSet();
    }
    setLoading(false);
  }, [setId]);

  // 当字库加载完成后，获取第一个汉字
  useEffect(() => {
    if (characterSet && characterSet.characters.length > 0) {
      getRandomCharacter();
    }
  }, [characterSet]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!currentCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">暂无汉字</h1>
          <a href="/" className="text-blue-500 hover:underline">返回首页</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* 标题和导航 */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
          <h1 className="text-4xl font-serif font-black text-foreground">中文认字</h1>
          <div className="w-24"></div> {/* 占位符保持居中 */}
        </div>

        {/* 主要学习区域 */}
        <Card className="p-8 bg-card border-border shadow-lg">
          <div className="text-center space-y-6">
            {/* 拼音区域 */}
            <div className="space-y-3">
              <div className="flex flex-wrap justify-center gap-3">
                {pinyin.map((pinyinText, index) => (
                  <div key={index} className="flex items-center gap-2 bg-accent/10 rounded-lg px-4 py-2">
                    <span className="text-2xl font-sans font-medium text-accent">{pinyinText}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => speakPinyin(pinyinText)}
                      className="h-8 w-8 p-0 hover:bg-accent/20"
                    >
                      <Volume2 className="h-4 w-4 text-accent" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* 汉字显示 */}
            <div className="py-8">
              <div className="text-9xl font-serif font-bold text-foreground select-none">
                {currentCharacter.char}
              </div>
            </div>

            {/* 笔画顺序展开区域 */}
            {showStrokes && (
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-center">
                  <h3 className="text-lg font-serif font-semibold text-foreground">笔画顺序</h3>
                </div>

                <div className="flex justify-center">
                  <div className="relative">
                    <svg
                      width="240"
                      height="240"
                      viewBox="0 0 100 100"
                      className="border-2 border-emerald-300 rounded-lg bg-background shadow-sm"
                    >
                      {/* 田字格辅助线 */}
                      <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path
                            d="M 50 0 L 0 0 0 50"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="0.3"
                            strokeDasharray="1,1"
                          />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#grid)" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="1,1" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.3" strokeDasharray="1,1" />
                    </svg>
                    
                    {/* 笔画动画覆盖在田字格上 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <StrokeAnimation
                        character={currentCharacter.char}
                        size={200}
                        autoPlay={true}
                        speed={1}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleStrokes}
            className="flex items-center gap-2 font-sans bg-transparent"
          >
            <Eye className="h-5 w-5" />
            {showStrokes ? "隐藏笔画" : "查看笔画"}
          </Button>

          <Button
            size="lg"
            onClick={getRandomCharacter}
            className="flex items-center gap-2 font-sans bg-primary hover:bg-primary/90"
          >
            <SkipForward className="h-5 w-5" />
            下一个字
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground font-sans">
          <p>点击拼音旁的喇叭图标可以听发音</p>
        </div>
      </div>
    </div>
  );
}
