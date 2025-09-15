// components/MainDisplay.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { StrokeAnimation } from "./StrokeAnimation";
import { AudioPlayer } from "./AudioPlayer";
import { wordService } from "../lib/client/wordService";
import { getPinyinForCharacter } from "../lib/pinyin";
import { CharacterSet, Character, SimpleCharacterSet } from "../lib/types";
import { Button } from "./ui/button";
import { Eye, ChevronsRight, BookCopy, Trash2, Plus, Settings2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { cn } from "@/lib/utils";

interface MainDisplayProps {
  initialSetId: string;
  onSetsChanged: () => void;
  onAddNewSet: () => void;
}

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

const shuffleCharacters = (characters: Character[]): Character[] => {
  const array = [...characters];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function MainDisplay({ initialSetId, onSetsChanged, onAddNewSet }: MainDisplayProps) {
  const [customCharacterSets, setCustomCharacterSets] = useState<SimpleCharacterSet[]>([]);
  const [currentCharacterSet, setCurrentCharacterSet] = useState<CharacterSet | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [shuffledDeck, setShuffledDeck] = useState<Character[]>([]);
  const [pinyinCurrentChar, setPinyinCurrentChar] = useState<string[]>([]);
  const [isLoadingMainDisplay, setIsLoadingMainDisplay] = useState(true);
  const [isPinyinLoading, setIsPinyinLoading] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [showStrokes, setShowStrokes] = useState(false);
  const [hanziWriterResponsiveContentSize, setHanziWriterResponsiveContentSize] = useState(getResponsiveHanziWriterContentSize());
  const pinyinRequestToken = useRef(0);

  const loadAllSetMetadata = useCallback(async () => {
    try {
      const sets = await wordService.getAllCharacterSets();
      setCustomCharacterSets(sets);
    } catch (err) {
      console.error("Failed to load set list for manager", err);
      toast.error("加载字库列表失败");
    }
  }, []);

  const switchCharacterSet = useCallback(async (setId: string) => {
    setShowManager(false);
    if (!setId) {
      setCurrentCharacterSet(null);
      setCurrentCharacter(null);
      setShuffledDeck([]);
      setPinyinCurrentChar([]);
      setIsPinyinLoading(false);
      return;
    }

    try {
      const set = await wordService.getCharacterSetById(setId);
      if (set) {
        setCurrentCharacterSet(set);
        if (set.characters.length > 0) {
          const newShuffledDeck = shuffleCharacters(set.characters);
          setCurrentCharacter(newShuffledDeck[0]);
          setShuffledDeck(newShuffledDeck.slice(1));
        } else {
          setCurrentCharacter(null);
          setShuffledDeck([]);
          setPinyinCurrentChar([]);
          setIsPinyinLoading(false);
        }
      } else {
        throw new Error("Character set not found or could not be loaded.");
      }
    } catch (error) {
      toast.error("切换字库失败。");
      console.error(error);
      setCurrentCharacterSet(null);
      setCurrentCharacter(null);
      setPinyinCurrentChar([]);
      setIsPinyinLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoadingMainDisplay(true);
    const loadInitialData = async () => {
      try {
        await switchCharacterSet(initialSetId);
        await loadAllSetMetadata();
      } catch (error) {
        console.error("Initial data loading failed:", error);
        toast.error("初始化数据加载失败。");
      } finally {
        setIsLoadingMainDisplay(false);
      }
    };
    if (initialSetId) loadInitialData();
    else setIsLoadingMainDisplay(false);
  }, [initialSetId, switchCharacterSet, loadAllSetMetadata]);

  useEffect(() => {
    const currentToken = ++pinyinRequestToken.current;
    if (!currentCharacter?.char) {
      setPinyinCurrentChar([]);
      setIsPinyinLoading(false);
      return;
    }

    setIsPinyinLoading(true);
    getPinyinForCharacter(currentCharacter.char)
      .then((pinyinResults) => {
        if (currentToken === pinyinRequestToken.current) {
          setPinyinCurrentChar(pinyinResults);
          setIsPinyinLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching pinyin:", error);
        if (currentToken === pinyinRequestToken.current) {
          setPinyinCurrentChar([]);
          setIsPinyinLoading(false);
        }
      });
    setShowStrokes(false);
  }, [currentCharacter]);

  const showNextCharacter = useCallback(() => {
    if (!currentCharacterSet || currentCharacterSet.characters.length < 2) {
      toast.error("字库中没有足够的字来切换。");
      return;
    }

    if (shuffledDeck.length > 0) {
      const nextChar = shuffledDeck[0];
      setCurrentCharacter(nextChar);
      setShuffledDeck(shuffledDeck.slice(1));
    } else {
      toast.success("新一轮开始！");
      let newShuffledDeck = shuffleCharacters(currentCharacterSet.characters);
      if (newShuffledDeck[0].id === currentCharacter?.id) {
        [newShuffledDeck[0], newShuffledDeck[1]] = [newShuffledDeck[1], newShuffledDeck[0]];
      }
      setCurrentCharacter(newShuffledDeck[0]);
      setShuffledDeck(newShuffledDeck.slice(1));
    }
  }, [currentCharacterSet, shuffledDeck, currentCharacter]);

  const handleDeleteSet = useCallback(
    async (setId: string) => {
      if (!confirm("确定要删除这个字库吗？此操作不可撤销。")) return;
      try {
        await wordService.deleteCharacterSet(setId);
        toast.success("字库删除成功！");
        onSetsChanged();
      } catch (error: any) {
        toast.error(`删除字库失败: ${error.message || "未知错误"}`);
      }
    },
    [onSetsChanged]
  );

  useEffect(() => {
    const updateSize = () => setHanziWriterResponsiveContentSize(getResponsiveHanziWriterContentSize());
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (isLoadingMainDisplay) return <div className="text-2xl font-bold animate-pulse">正在加载字库...</div>;

  const hanziWriterContainerSize = hanziWriterResponsiveContentSize + 8;

  return (
    <>
      {/* 弹窗 + 遮罩 */}
      {showStrokes && currentCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setShowStrokes(false)}
          />

          {/* 弹窗内容 */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative border-4 border-primary rounded-2xl bg-white dark:bg-gray-900 text-card-foreground shadow-2xl overflow-hidden animate-zoom-in"
            style={{
              width: hanziWriterContainerSize,
              height: hanziWriterContainerSize,
            }}
          >
            <StrokeAnimation
              key={currentCharacter.char + "-fullscreen-" + hanziWriterResponsiveContentSize}
              character={currentCharacter.char}
              size={hanziWriterResponsiveContentSize}
            />
          </div>
        </div>
      )}

      {/* 页面主体 */}
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4 md:p-0">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {currentCharacter && (
            <>
              <Button onClick={() => setShowStrokes(!showStrokes)} variant={showStrokes ? "default" : "outline"}>
                <Eye className="mr-2 h-4 w-4" /> {showStrokes ? "隐藏笔画" : "显示笔画"}
              </Button>

              <Button
                variant="default"
                onClick={showNextCharacter}
                disabled={!currentCharacterSet || currentCharacterSet.characters.length < 2 || isPinyinLoading}
              >
                下一个字 <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          <Button onClick={() => setShowManager(!showManager)} variant={showManager ? "default" : "outline"} className="max-w-[200px] truncate">
            <BookCopy className="mr-2 h-4 w-4" />
            {currentCharacterSet ? currentCharacterSet.name : "字库管理"}
          </Button>
        </div>

        {showManager && (
          <Card className="animate-in fade-in-0 zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>字库管理</CardTitle>
                <CardDescription>当前: {currentCharacterSet?.name || "N/A"}</CardDescription>
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
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      currentCharacterSet?.id === set.id ? "bg-accent text-accent-foreground" : "bg-transparent hover:bg-muted"
                    )}
                    onClick={() => switchCharacterSet(set.id)}
                  >
                    <div className="font-medium">
                      {set.name} <span className="text-sm text-muted-foreground">({set.characterCount}字)</span>
                    </div>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center flex flex-col items-center gap-4">
                <div
                  className="flex flex-wrap justify-center gap-3 relative min-h-[40px] max-w-full w-full"
                  style={{ width: "fit-content", minWidth: "150px" }}
                >
                  {pinyinCurrentChar.map((pinyin, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-accent rounded-lg px-3 py-1 transition-opacity duration-200"
                      style={{ opacity: isPinyinLoading ? 0.5 : 1 }}
                    >
                      <span className="text-2xl font-medium text-accent-foreground">{pinyin}</span>
                      <AudioPlayer pinyin={pinyin} />
                    </div>
                  ))}

                  {isPinyinLoading && (
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-lg transition-opacity duration-200">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}

                  {isPinyinLoading && pinyinCurrentChar.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-medium text-accent-foreground">
                      加载拼音中...
                    </div>
                  )}
                </div>

                <div className="text-9xl font-serif my-4">{currentCharacter.char}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}