"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import HanziWriter from "hanzi-writer"
import { getPinyinForCharacter } from '../lib/pinyin'
import { speakCharacterImmediate, isSpeechSupported, speakText } from '../lib/speechService'
import { getWordForReading } from '../lib/wordDatabase'
import SimpleStrokeAnimation from '../components/SimpleStrokeAnimation'

// 临时内联StrokeAnimation组件 - 添加循环播放功能
function StrokeAnimation({ character, size = 240, autoPlay = true, speed = 1, loop = true }: {
  character: string;
  size?: number;
  autoPlay?: boolean;
  speed?: number;
  loop?: boolean;
}) {
  const writerRef = useRef<HTMLDivElement>(null);
  const hanziWriterRef = useRef<any>(null);
  const animationLoopRef = useRef<boolean>(false);

  useEffect(() => {
    if (!writerRef.current || !character) {
      console.log('❌ 主页面 StrokeAnimation 缺少必要条件:', {
        hasContainer: !!writerRef.current,
        character
      });
      return;
    }

    console.log('🔧 主页面初始化 HanziWriter，字符:', character);

    // 清空容器
    writerRef.current.innerHTML = '';

    try {
      // 创建新的 HanziWriter 实例
      const writer = HanziWriter.create(writerRef.current, character, {
        width: size,
        height: size,
        padding: 20,
        strokeAnimationSpeed: 1, // 每笔画的动画速度
        delayBetweenStrokes: 500, // 笔画间0.5秒延迟
        showOutline: true, // 显示灰色轮廓作为参考
        showCharacter: false, // 不显示完整汉字，只显示动画
        strokeColor: '#22c55e', // 绿色笔画
        highlightColor: '#16a34a', // 深绿色高亮
        radicalColor: '#22c55e',
        drawingColor: '#22c55e', // 绘制颜色也设为绿色
        outlineColor: '#DDD', // 灰色轮廓颜色
        strokeWidth: 6, // 更粗的笔画宽度
        outlineWidth: 2 // 轮廓宽度
      });

      hanziWriterRef.current = writer;

      // 温和地隐藏灰色轮廓的函数
      const hideGrayOutlines = () => {
        if (writerRef.current) {
          const svg = writerRef.current.querySelector('svg');
          if (svg) {
            const paths = svg.querySelectorAll('path');
            paths.forEach(path => {
              const stroke = path.getAttribute('stroke');

              // 只隐藏明确的灰色轮廓，保留所有其他元素
              if (stroke === '#DDD' || stroke === '#ddd' || stroke === '#ccc' || stroke === '#cccccc') {
                path.style.opacity = '0';
              }
            });
          }
        }
      };

      // 播放动画的函数 - 支持循环播放
      const playAnimation = () => {
        if (!hanziWriterRef.current || !animationLoopRef.current) return;

        console.log('🎬 主页面开始播放笔画动画，字符:', character);

        // 重置字符状态，准备动画
        hanziWriterRef.current.hideCharacter();

        // 等待重置完成，然后开始动画
        setTimeout(() => {
          if (!hanziWriterRef.current || !animationLoopRef.current) return;

          console.log('▶️ 主页面开始动画播放');

          // 开始动画
          hanziWriterRef.current.animateCharacter({
            onComplete: () => {
              console.log('✅ 主页面笔画动画完成');
              console.log('📊 动画统计 - 速度:', 0.05, '笔画间延迟:', 3000, 'ms');

              // 如果启用循环播放且循环标志仍然为 true
              if (loop && autoPlay && hanziWriterRef.current && animationLoopRef.current) {
                console.log('🔄 主页面准备重新播放动画');
                // 等待更长时间再重新播放，让用户看到完整效果
                const timeoutId = setTimeout(() => {
                  if (animationLoopRef.current && hanziWriterRef.current) {
                    console.log('🔄 开始下一轮动画');
                    playAnimation();
                  } else {
                    console.log('❌ 循环被中断，组件已卸载');
                  }
                }, 5000); // 5秒后重新播放，让用户充分看到完整字符

                // 保存 timeout ID 以便清理
                hanziWriterRef.current._loopTimeoutId = timeoutId;
              }
            },
            onError: (error: any) => {
              console.error('❌ 主页面笔画动画错误:', error);
            }
          });
        }, 200); // 等待重置完成
      };

      // 如果设置了自动播放，开始动画
      if (autoPlay) {
        console.log('🎬 主页面启动自动播放，循环:', loop);
        animationLoopRef.current = true;

        // 先显示轮廓，确保字符可见
        setTimeout(() => {
          console.log('📝 主页面显示字符轮廓');
          if (hanziWriterRef.current) {
            hanziWriterRef.current.showCharacter();
            setTimeout(() => {
              playAnimation();
            }, 500);
          }
        }, 300);
      } else {
        // 如果不自动播放，至少显示字符轮廓
        setTimeout(() => {
          if (hanziWriterRef.current) {
            hanziWriterRef.current.showCharacter();
          }
          hideGrayOutlines();
        }, 500);
      }

    } catch (error) {
      console.error('创建HanziWriter失败:', error);
    }

    // 清理函数
    return () => {
      console.log('🧹 主页面清理 StrokeAnimation 组件');

      // 停止循环
      animationLoopRef.current = false;

      if (hanziWriterRef.current) {
        // 清理循环定时器
        if (hanziWriterRef.current._loopTimeoutId) {
          clearTimeout(hanziWriterRef.current._loopTimeoutId);
          hanziWriterRef.current._loopTimeoutId = null;
        }

        try {
          if (typeof hanziWriterRef.current.cancelAnimation === 'function') {
            hanziWriterRef.current.cancelAnimation();
          } else if (typeof hanziWriterRef.current.pauseAnimation === 'function') {
            hanziWriterRef.current.pauseAnimation();
          }
        } catch (e) {
          console.log('主页面清理时忽略错误:', e);
        }
        hanziWriterRef.current = null;
      }
    };
  }, [character]); // 只在字符变化时重新初始化

  return (
    <div className="hanzi-writer-container">
      <div
        ref={writerRef}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
import '../styles/hanzi-writer.css'

// 类型定义
interface Character {
  char: string
  pinyin: string[]
  strokeOrder: string[]
}

interface CharacterSet {
  id: string
  name: string
  description: string
  characters: Character[]
}

// 默认字库数组 - 现在为空，用户需要自己导入字库
const characterSets: CharacterSet[] = []



export default function ChineseCharacterLearning() {
  const router = useRouter()
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)
  const [showStrokes, setShowStrokes] = useState(false) // 默认隐藏笔画动画
  const [currentCharacterSet, setCurrentCharacterSet] = useState<CharacterSet | null>(null)
  const [showCharacterSetSelector, setShowCharacterSetSelector] = useState(false)
  const [showImportForm, setShowImportForm] = useState(false)
  const [newLibraryName, setNewLibraryName] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [customCharacterSets, setCustomCharacterSets] = useState<CharacterSet[]>([])

  // 保存字库到localStorage
  const saveCharacterSetToDatabase = async (characterSet: CharacterSet): Promise<boolean> => {
    try {
      const { saveCharacterSet } = await import('../lib/localStorageDatabase');
      return saveCharacterSet(characterSet);
    } catch (error) {
      console.error('保存字库失败:', error);
      return false;
    }
  };

  // 删除字库的函数
  const deleteCharacterSet = async (setId: string) => {
    if (confirm('确定要删除这个字库吗？此操作不可撤销。')) {
      try {
        const { deleteCharacterSet: deleteFromLocal } = await import('../lib/localStorageDatabase');
        const success = deleteFromLocal(setId);

        if (success) {
          // 从本地状态中删除
          const updatedCustomSets = customCharacterSets.filter(set => set.id !== setId);
          setCustomCharacterSets(updatedCustomSets);

          // 如果删除的是当前选中的字库，清空当前选择
          if (currentCharacterSet?.id === setId) {
            setCurrentCharacterSet(null);
            setCurrentCharacter(null);

            // 如果还有其他字库，自动选择第一个
            if (updatedCustomSets.length > 0) {
              const firstSet = updatedCustomSets[0];
              setCurrentCharacterSet(firstSet);
              if (firstSet.characters.length > 0) {
                const randomIndex = Math.floor(Math.random() * firstSet.characters.length);
                setCurrentCharacter(firstSet.characters[randomIndex]);
              }
            }
          }
        } else {
          alert('删除字库失败，请重试');
        }
      } catch (error) {
        console.error('删除字库失败:', error);
        alert('删除字库失败，请重试');
      }
    }
  }

  // 合并默认字库和自定义字库
  const allCharacterSets = [...characterSets, ...customCharacterSets]

  // 从localStorage加载字库
  useEffect(() => {
    const loadCharacterSets = async () => {
      try {
        // 直接从localStorage加载
        const { getCharacterSets } = await import('../lib/localStorageDatabase');
        let characterSets = getCharacterSets();

        // 如果没有字库，添加一个测试字库
        if (characterSets.length === 0) {
          const testCustomSet: CharacterSet = {
            id: "test_custom",
            name: "测试自定义字库",
            description: "测试用的自定义字库 - 5个字符",
            characters: [
              { char: "春", pinyin: [], strokeOrder: [] },
              { char: "夏", pinyin: [], strokeOrder: [] },
              { char: "秋", pinyin: [], strokeOrder: [] },
              { char: "冬", pinyin: [], strokeOrder: [] },
              { char: "季", pinyin: [], strokeOrder: [] },
            ]
          };

          // 保存测试字库到localStorage
          const { saveCharacterSet } = await import('../lib/localStorageDatabase');
          const success = saveCharacterSet(testCustomSet);
          if (success) {
            characterSets = [testCustomSet];
          }
        }

        setCustomCharacterSets(characterSets);

        // 自动选择第一个字库
        if (characterSets.length > 0) {
          const firstSet = characterSets[0];
          setCurrentCharacterSet(firstSet);
          if (firstSet.characters.length > 0) {
            const randomIndex = Math.floor(Math.random() * firstSet.characters.length);
            setCurrentCharacter(firstSet.characters[randomIndex]);
          }
        }
      } catch (error) {
        console.error('加载字库失败:', error);
      }
    };

    loadCharacterSets();
  }, [])



  // 使用pinyin-pro库获取拼音
  const getBasicPinyin = (char: string): string[] => {
    try {
      const pinyinResults = getPinyinForCharacter(char)
      return pinyinResults.map(result => result.pinyin)
    } catch (error) {
      console.error('获取拼音失败:', error)
      return [char + "?"]
    }
  }

  // 优化的语音播放功能 - 朗读词语而不是单个汉字
  const speakPinyin = (pinyin?: string) => {
    if (!currentCharacter) return

    try {
      if (pinyin) {
        // 如果传递了具体拼音，使用该拼音朗读对应词语
        speakCharacterWithPinyin(currentCharacter.char, pinyin);
      } else {
        // 否则使用默认的第一个拼音
        speakCharacterImmediate(currentCharacter.char);
      }
    } catch (error) {
      console.error('语音播放失败:', error);
    }
  }

  // 根据指定拼音朗读汉字对应的词语
  const speakCharacterWithPinyin = (char: string, pinyin: string) => {
    try {
      const word = getWordForReading(char, pinyin);
      console.log(`朗读汉字 "${char}" (${pinyin}) -> 词语 "${word}"`);

      // 使用语音服务朗读词语
      speakText(word);
    } catch (error) {
      console.error('朗读指定拼音失败:', error);
      // 降级到朗读单个汉字
      speakText(char);
    }
  }

  // 导入字库
  const importCharacterSet = async () => {
    if (!importFile || !newLibraryName.trim()) {
      alert('请选择文件并输入字库名称')
      return
    }

    try {
      const text = await importFile.text()
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

      // 为每个汉字创建字符对象，拼音会自动从拼音库获取
      const characters: Character[] = lines.map(char => ({
        char: char,
        pinyin: [], // 拼音会在显示时自动获取
        strokeOrder: []
      }))

      const newCharacterSet: CharacterSet = {
        id: `custom_${Date.now()}`,
        name: newLibraryName.trim(),
        description: `自定义字库 - ${characters.length} 个汉字`,
        characters: characters
      }

      // 保存到数据库
      const success = await saveCharacterSetToDatabase(newCharacterSet);

      if (success) {
        const updatedSets = [...customCharacterSets, newCharacterSet]
        setCustomCharacterSets(updatedSets)

        // 如果这是第一个字库，设置为当前字库
        if (!currentCharacterSet) {
          setCurrentCharacterSet(newCharacterSet)
          if (characters.length > 0) {
            const randomIndex = Math.floor(Math.random() * characters.length)
            setCurrentCharacter(characters[randomIndex])
          }
        }

        setNewLibraryName("")
        setImportFile(null)
        setShowImportForm(false)

        alert(`成功导入 ${characters.length} 个汉字到字库 "${newLibraryName}"`)
      } else {
        alert('保存字库失败，请重试')
      }
    } catch (error) {
      console.error('导入字库失败:', error)
      alert('导入失败，请检查文件格式')
    }
  }

  // 切换字库
  const switchCharacterSet = (characterSet: CharacterSet) => {
    setCurrentCharacterSet(characterSet)
    setShowCharacterSetSelector(false)
    // 切换字库后自动选择新字库中的一个汉字
    const randomIndex = Math.floor(Math.random() * characterSet.characters.length)
    const newCharacter = characterSet.characters[randomIndex]
    setCurrentCharacter(newCharacter)
    setShowStrokes(false) // 换字时收起笔画动画


  }

  // 随机选择汉字
  const getRandomCharacter = () => {
    if (!currentCharacterSet || currentCharacterSet.characters.length === 0) return
    const randomIndex = Math.floor(Math.random() * currentCharacterSet.characters.length)
    const newCharacter = currentCharacterSet.characters[randomIndex]
    setCurrentCharacter(newCharacter)
    setShowStrokes(false) // 换字时收起笔画动画


  }

  // 切换笔画显示
  const toggleStrokes = () => {
    setShowStrokes(!showStrokes)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '672px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* 顶部控制按钮 - 从左到右：查看笔画、换一个字、字库管理 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {currentCharacter && (
            <>
              <button
                onClick={() => setShowStrokes(!showStrokes)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: showStrokes ? '#15803d' : 'white',
                  color: showStrokes ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                👁️ {showStrokes ? "隐藏笔画" : "查看笔画"}
              </button>

              <button
                onClick={getRandomCharacter}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#15803d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                🔄 换一个字
              </button>
            </>
          )}

          <button
            onClick={() => setShowCharacterSetSelector(!showCharacterSetSelector)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: showCharacterSetSelector ? '#15803d' : (currentCharacterSet ? '#e0f2fe' : 'white'),
              color: showCharacterSetSelector ? 'white' : (currentCharacterSet ? '#0369a1' : '#374151'),
              border: `1px solid ${currentCharacterSet ? '#0ea5e9' : '#e5e7eb'}`,
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={currentCharacterSet ? `当前字库: ${currentCharacterSet.name}` : '字库管理'}
          >
            {currentCharacterSet ? (
              <>📚 {currentCharacterSet.name}</>
            ) : (
              <>⚙️ 字库管理</>
            )}
          </button>
        </div>

        {/* 字库管理面板 */}
        {showCharacterSetSelector && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'serif',
                  margin: '0 0 4px 0'
                }}>字库管理</h3>
                {currentCharacterSet && (
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '0',
                    fontStyle: 'italic'
                  }}>
                    当前: {currentCharacterSet.name} ({currentCharacterSet.characters.length}个字符)
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowImportForm(!showImportForm)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#15803d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                + 添加字库
              </button>
            </div>

            {/* 导入字库表单 */}
            {showImportForm && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  导入字库
                </div>
                <input
                  type="text"
                  placeholder="字库名称"
                  value={newLibraryName}
                  onChange={(e) => setNewLibraryName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginBottom: '8px'
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  请选择 .txt 文件，每行一个汉字
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={importCharacterSet}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#15803d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    导入
                  </button>
                  <button
                    onClick={() => setShowImportForm(false)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 字库列表 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '240px',
              overflowY: 'auto'
            }}>
              {allCharacterSets.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
                  <div>暂无字库，请先添加字库</div>
                </div>
              ) : (
                allCharacterSets.map((characterSet) => (
                  <div
                    key={characterSet.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s ease',
                      backgroundColor: currentCharacterSet?.id === characterSet.id ? 'rgba(21, 128, 61, 0.1)' : 'rgba(249, 250, 251, 0.5)',
                      borderColor: currentCharacterSet?.id === characterSet.id ? '#15803d' : '#e5e7eb'
                    }}
                  >
                    <div
                      style={{ cursor: 'pointer', flex: 1 }}
                      onClick={() => switchCharacterSet(characterSet)}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        {characterSet.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {characterSet.characters.length} 个汉字
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* 只有自定义字库才显示删除按钮 */}
                      {!characterSets.find(cs => cs.id === characterSet.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCharacterSet(characterSet.id);
                          }}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                          title="删除字库"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!currentCharacterSet ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              请先添加字库
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              点击上方"字库管理"按钮开始添加汉字学习内容
            </p>
            <button
              onClick={() => setShowCharacterSetSelector(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#15803d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              添加字库
            </button>
          </div>
        ) : !currentCharacter ? (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🈳</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
              字库为空
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              请切换到其他字库或导入新的汉字
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: '20px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 拼音显示 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                {(() => {
                  // 获取有效的拼音，如果没有则使用基础拼音查找
                  const validPinyin = currentCharacter.pinyin.filter((p) => p.trim())
                  const displayPinyin = validPinyin.length > 0 ? validPinyin : getBasicPinyin(currentCharacter.char)

                  return displayPinyin.map((pinyin, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(132, 204, 22, 0.1)',
                      borderRadius: '8px',
                      padding: '6px 12px'
                    }}>
                      <span style={{
                        fontSize: '24px',
                        fontWeight: '500',
                        color: '#84cc16'
                      }}>{pinyin}</span>
                      <button
                        onClick={() => speakPinyin(pinyin)}
                        style={{
                          height: '32px',
                          width: '32px',
                          padding: '0',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        🔊
                      </button>
                    </div>
                  ))
                })()}
              </div>

              {/* 汉字显示 */}
              <div style={{ padding: '20px 0' }}>
                <div style={{
                  fontSize: '128px',
                  fontWeight: 'bold',
                  color: '#374151',
                  fontFamily: 'serif',
                  userSelect: 'none'
                }}>
                  {currentCharacter.char}
                </div>
              </div>

              {/* 笔画动画 */}
              {showStrokes && (
                <div style={{
                  backgroundColor: 'rgba(120, 60, 97, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(120, 60, 97, 0.1)'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#374151',
                    fontFamily: 'serif',
                    marginBottom: '16px'
                  }}>笔画演示</div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      position: 'relative',
                      border: '2px solid #15803d',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                    }}>
                      <StrokeAnimation
                        key={currentCharacter.char} // 添加 key 确保字符变化时重新创建组件
                        character={currentCharacter.char}
                        size={240}
                        autoPlay={true}
                        speed={1}
                        loop={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
