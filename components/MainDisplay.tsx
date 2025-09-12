// components/MainDisplay.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { StrokeAnimation } from './StrokeAnimation';
import { AudioPlayer } from './AudioPlayer';
import { wordService } from '../lib/client/wordService';
import { getPinyinForCharacter } from '../lib/pinyin';
import { CharacterSet, Character, SimpleCharacterSet } from '../lib/types';
import { Button } from './ui/button';
import { Eye, ChevronsRight, BookCopy, Trash2, Plus, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface MainDisplayProps {
  initialSetId: string;
  onSetsChanged: () => void;
  onAddNewSet: () => void;
}

// 辅助函数：计算 HanziWriter 的响应式尺寸
const getResponsiveHanziWriterContentSize = () => {
  const minContentSize = 150;
  const maxContentSize = 580;
  const borderWidth = 4;
  const totalBorderWidth = borderWidth * 2;
  const extraViewportMargin = 20;
  const availableWidth = window.innerWidth - totalBorderWidth - extraViewportMargin;
  const availableHeight = window.innerHeight - totalBorderWidth - extraViewportMargin;
  const calculatedSize = Math.min(availableWidth, availableHeight);
  return Math.max(minContentSize, Math.min(calculatedSize, maxContentSize));
};

// 【新增】辅助函数：用于打乱数组顺序 (Fisher-Yates 算法)
// 我们将用它来创建每一轮的“牌堆”
const shuffleCharacters = (characters: Character[]): Character[] => {
  const array = [...characters]; // 创建副本以避免修改原始数组
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // ES6 解构赋值交换元素
  }
  return array;
};


export default function MainDisplay({ initialSetId, onSetsChanged, onAddNewSet }: MainDisplayProps) {
  const [customCharacterSets, setCustomCharacterSets] = useState<SimpleCharacterSet[]>([]);
  const [currentCharacterSet, setCurrentCharacterSet] = useState<CharacterSet | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  
  // 【新增】状态：用于存放当前这一轮尚未出现的字（我们的“牌堆”）
  const [shuffledDeck, setShuffledDeck] = useState<Character[]>([]);

  const [pinyinCurrentChar, setPinyinCurrentChar] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showManager, setShowManager] = useState(false);
  const [showStrokes, setShowStrokes] = useState(false);
  const [hanziWriterResponsiveContentSize, setHanziWriterResponsiveContentSize] = useState(getResponsiveHanziWriterContentSize());

  const loadAllSetMetadata = useCallback(async () => {
    try {
      const sets = await wordService.getAllCharacterSets();
      setCustomCharacterSets(sets);
    } catch(err) {
      console.error("Failed to load set list for manager", err);
      toast.error("加载字库列表失败");
    }
  }, []);

  // 【修改】核心逻辑：切换字库时，直接生成第一轮的“牌堆”
  const switchCharacterSet = useCallback(async (setId: string, isInitialLoad = false) => {
    if (!isInitialLoad) {
      setIsLoading(true);
    }
    setShowManager(false);
    try {
      const set = await wordService.getCharacterSetById(setId);
      if (set) {
        setCurrentCharacterSet(set);
        if (set.characters.length > 0) {
          // 1. 打乱整个字库的顺序
          const newShuffledDeck = shuffleCharacters(set.characters);
          // 2. 从打乱后的牌堆中取出第一个字作为当前字
          setCurrentCharacter(newShuffledDeck[0]);
          // 3. 将剩余的字存入牌堆状态中，用于后续的“下一个”
          setShuffledDeck(newShuffledDeck.slice(1));
        } else {
          // 如果字库为空，清空所有相关状态
          setCurrentCharacter(null);
          setShuffledDeck([]);
        }
      } else {
         throw new Error("Character set not found.");
      }
    } catch (error) {
        toast.error('切换字库失败。');
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    switchCharacterSet(initialSetId, true);
    loadAllSetMetadata();
  }, [initialSetId, switchCharacterSet, loadAllSetMetadata]);

  useEffect(() => {
    if (currentCharacter?.char) {
      getPinyinForCharacter(currentCharacter.char).then(pinyinResults => {
        setPinyinCurrentChar(pinyinResults);
      }).catch(error => {
        console.error('Error fetching pinyin:', error);
        setPinyinCurrentChar([]);
      });
    } else {
      setPinyinCurrentChar([]);
    }
    setShowStrokes(false);
  }, [currentCharacter]);
  
  // 【修改】核心逻辑：点击“下一个字”的全新实现
  const showNextCharacter = useCallback(() => {
    // 保护条件：字库不存在或只有一个字，无法切换
    if (!currentCharacterSet || currentCharacterSet.characters.length < 2) {
        toast.error('字库中没有足够的字来切换。');
        return;
    }

    // 情况1：当前牌堆中还有剩余的字
    if (shuffledDeck.length > 0) {
      const nextChar = shuffledDeck[0];      // 从牌堆顶部取出一个字
      setCurrentCharacter(nextChar);         // 设置为当前字
      setShuffledDeck(shuffledDeck.slice(1));  // 更新牌堆（移除已取出的字）
    } else {
      // 情况2：牌堆已空，说明一轮结束，开始新一轮
      toast.success('新一轮开始！');
      
      // 重新打乱完整的字库
      let newShuffledDeck = shuffleCharacters(currentCharacterSet.characters);

      //  为了防止新一轮的第一个字和上一轮的最后一个字重复，做一个简单的检查和交换
      if (newShuffledDeck[0].id === currentCharacter?.id) {
        // 和第二位交换位置（因为我们已经检查过字数大于1，所以 newShuffledDeck[1] 必定存在）
        [newShuffledDeck[0], newShuffledDeck[1]] = [newShuffledDeck[1], newShuffledDeck[0]];
      }

      // 像初始化时一样，设置新一轮的当前字和牌堆
      setCurrentCharacter(newShuffledDeck[0]);
      setShuffledDeck(newShuffledDeck.slice(1));
    }
  }, [currentCharacterSet, shuffledDeck, currentCharacter]); // 依赖项更新
  
  const handleDeleteSet = useCallback(async (setId: string) => {
    if (!confirm('确定要删除这个字库吗？此操作不可撤销。')) return;
    
    try {
      await wordService.deleteCharacterSet(setId);
      toast.success('字库删除成功！');
      onSetsChanged();
    } catch (error: any) {
      toast.error(`删除字库失败: ${error.message || '未知错误'}`);
    }
  }, [onSetsChanged]);

  useEffect(() => {
    const updateSize = () => {
      setHanziWriterResponsiveContentSize(getResponsiveHanziWriterContentSize());
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (isLoading) {
       return <div className="text-2xl font-bold text-gray-700 animate-pulse">正在加载字库...</div>;
  }
  
  const hanziWriterContainerSize = hanziWriterResponsiveContentSize + (4 * 2); 

  return (
    <>
      {showStrokes && currentCharacter && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in-0"
          onClick={() => setShowStrokes(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative border-4 border-green-500 rounded-2xl bg-white shadow-2xl overflow-hidden"
            style={{ 
              width: hanziWriterContainerSize, 
              height: hanziWriterContainerSize 
            }}
          >
            <StrokeAnimation 
              key={currentCharacter.char + '-fullscreen'} 
              character={currentCharacter.char} 
              size={hanziWriterResponsiveContentSize}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4 md:p-0">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {currentCharacter && (
            <>
              <Button onClick={() => setShowStrokes(!showStrokes)} variant={showStrokes ? 'default' : 'outline'}>
                <Eye className="mr-2 h-4 w-4" /> {showStrokes ? "隐藏笔画" : "显示笔画"}
              </Button>
              {/* 【修改】当字库只有一个字时，禁用“下一个字”按钮 */}
              <Button onClick={showNextCharacter} disabled={!currentCharacterSet || currentCharacterSet.characters.length < 2}>
                下一个字 <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
          <Button onClick={() => setShowManager(!showManager)} variant="outline" className="max-w-[200px] truncate">
            <BookCopy className="mr-2 h-4 w-4" />
            {currentCharacterSet ? currentCharacterSet.name : '字库管理'}
          </Button>
        </div>

        {showManager && (
          <Card className="animate-in fade-in-0 zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>字库管理</CardTitle>
                <CardDescription>当前: {currentCharacterSet?.name || 'N/A'}</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setShowManager(false); onAddNewSet(); }}>
                <Plus className="mr-2 h-4 w-4" /> 导入新字库
              </Button>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {customCharacterSets.map((set) => (
                  <div
                    key={set.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer
                      ${currentCharacterSet?.id === set.id ? 'bg-green-100 border-green-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => switchCharacterSet(set.id)}
                  >
                    <div className="font-medium">{set.name} <span className="text-gray-500 text-sm">({set.characterCount}字)</span></div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-100 hover:text-red-700 h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); handleDeleteSet(set.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {!currentCharacterSet || !currentCharacter ? (
          <Card className="text-center p-8">
              <CardHeader>
                  <CardTitle className="text-2xl">字库为空或加载失败</CardTitle>
                  <CardDescription>
                      这个字库 "{currentCharacterSet?.name}" 中没有汉字。请管理您的字库。
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={() => setShowManager(true)}>
                      <Settings2 className="mr-2 h-4 w-4" /> 管理字库
                  </Button>
              </CardContent>
          </Card>
        ) : (
          <Card className="bg-green-50/50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {pinyinCurrentChar.map((pinyin, index) => (
                    <div key={index} className="flex items-center gap-2 bg-lime-100/70 rounded-lg px-3 py-1">
                      <span className="text-2xl font-medium text-lime-700">{pinyin}</span>
                      <AudioPlayer pinyin={pinyin} />
                    </div>
                  ))}
                </div>

                <div className="text-9xl font-serif text-gray-800 my-4">
                  {currentCharacter.char}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
