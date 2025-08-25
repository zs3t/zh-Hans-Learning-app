import { pinyin } from 'pinyin-pro';

export interface PinyinResult {
  pinyin: string;
  tone: number;
}

// 小学阶段需要简化的多音字发音映射（只简化不太常用的多音字）
// 保留常用多音字如"乐"、"重"、"长"、"行"等的多个读音
const primarySchoolPinyin: Record<string, string[]> = {
  // 保留常用多音字的多个读音
  "乐": ["lè", "yuè"], // 保留"快乐"和"音乐"两个读音
  "长": ["cháng", "zhǎng"], // 保留"长短"和"长大"两个读音
  "重": ["zhòng", "chóng"], // 保留"重要"和"重复"两个读音
  "行": ["xíng", "háng"], // 保留"行走"和"银行"两个读音
  "发": ["fā", "fà"], // 保留"发现"和"头发"两个读音
  "为": ["wèi", "wéi"], // 保留"为了"和"因为"两个读音
  "还": ["hái", "huán"], // 保留"还有"和"还书"两个读音
  "都": ["dōu", "dū"], // 保留"都是"和"首都"两个读音
  "背": ["bèi", "bēi"], // 保留"背书"和"背包"两个读音
  "倒": ["dǎo", "dào"], // 保留"倒下"和"倒水"两个读音
  "教": ["jiāo", "jiào"], // 保留"教书"和"教育"两个读音
  "觉": ["jiào", "jué"], // 保留"睡觉"和"觉得"两个读音
  "应": ["yīng", "yìng"], // 保留"应该"和"答应"两个读音
  "将": ["jiāng", "jiàng"], // 保留"将来"和"将军"两个读音
  "当": ["dāng", "dàng"], // 保留"当时"和"当作"两个读音
  "调": ["tiáo", "diào"], // 保留"调节"和"调查"两个读音
  "分": ["fēn", "fèn"], // 保留"分开"和"分外"两个读音
  "空": ["kōng", "kòng"], // 保留"天空"和"空隙"两个读音
  "量": ["liàng", "liáng"], // 保留"数量"和"测量"两个读音
  "少": ["shǎo", "shào"], // 保留"多少"和"少年"两个读音
  "正": ["zhèng", "zhēng"], // 保留"正确"和"正月"两个读音
  "中": ["zhōng", "zhòng"], // 保留"中间"和"中奖"两个读音
  "转": ["zhuǎn", "zhuàn"], // 保留"转弯"和"转动"两个读音

  // 简化不太常用的多音字，只保留最常用读音
  "得": ["de"], // 只保留助词的读音，去掉"得到"的dé和"得意"的děi
  "着": ["zhe"], // 只保留助词的读音，去掉"着急"的zháo
  "了": ["le"], // 只保留助词的读音，去掉"了解"的liǎo
  "的": ["de"], // 只保留助词的读音，去掉"目的"的dì
  "地": ["de"], // 只保留副词标志的读音，去掉"土地"的dì
  "把": ["bǎ"], // 只保留"把握"的读音，去掉"刀把"的bà
  "干": ["gàn"], // 只保留"干活"的读音，去掉"干净"的gān
  "兴": ["xìng"], // 只保留"高兴"的读音，去掉"兴起"的xīng
  "只": ["zhǐ"], // 只保留"只有"的读音，去掉"一只"的zhī
  "种": ["zhǒng"], // 只保留"种类"的读音，去掉"种地"的zhòng
  "数": ["shù"], // 只保留"数学"的读音，去掉"数数"的shǔ
  "便": ["biàn"], // 只保留"方便"的读音，去掉"便宜"的pián
  "朝": ["cháo"], // 只保留"朝向"的读音，去掉"朝代"的zhāo
  "处": ["chù"], // 只保留"地处"的读音，去掉"处理"的chǔ
  "传": ["chuán"], // 只保留"传说"的读音，去掉"传记"的zhuàn
  "弹": ["tán"], // 只保留"弹琴"的读音，去掉"子弹"的dàn
  "缝": ["féng"], // 只保留"缝合"的读音，去掉"缝隙"的fèng
  "供": ["gōng"], // 只保留"供给"的读音，去掉"供品"的gòng
  "华": ["huá"], // 只保留"中华"的读音，去掉"华山"的huà
  "几": ["jǐ"], // 只保留"几个"的读音，去掉"茶几"的jī
  "假": ["jiǎ"], // 只保留"真假"的读音，去掉"假期"的jià
  "结": ["jié"], // 只保留"结果"的读音，去掉"结实"的jiē
  "解": ["jiě"], // 只保留"解决"的读音，去掉"解送"的jiè
  "禁": ["jìn"], // 只保留"禁止"的读音，去掉"禁受"的jīn
  "卷": ["juàn"], // 只保留"试卷"的读音，去掉"卷起"的juǎn
  "累": ["lèi"], // 只保留"疲累"的读音，去掉"累积"的lěi
  "模": ["mó"], // 只保留"模仿"的读音，去掉"模样"的mú
  "难": ["nán"], // 只保留"困难"的读音，去掉"难民"的nàn
  "宁": ["níng"], // 只保留"宁静"的读音，去掉"宁可"的nìng
  "泡": ["pào"], // 只保留"泡沫"的读音，去掉"泡茶"的pāo
  "铺": ["pù"], // 只保留"店铺"的读音，去掉"铺床"的pū
  "强": ["qiáng"], // 只保留"强大"的读音，去掉"勉强"的qiǎng
  "散": ["sàn"], // 只保留"散开"的读音，去掉"散步"的sǎn
  "什": ["shén"], // 只保留"什么"的读音，去掉"什物"的shí
  "似": ["sì"], // 只保留"似乎"的读音，去掉"似的"的shì
  "宿": ["sù"], // 只保留"住宿"的读音，去掉"星宿"的xiù
  "削": ["xuē"], // 只保留"削减"的读音，去掉"削皮"的xiāo
  "血": ["xuè"], // 只保留"血液"的读音，去掉"血淋淋"的xiě
  "要": ["yào"], // 只保留"需要"的读音，去掉"要求"的yāo
  "一": ["yī"], // 只保留基本读音，去掉变调
  "音": ["yīn"], // 只保留"声音"的读音
  "作": ["zuò"], // 只保留"工作"的读音，去掉"作坊"的zuō

  // 更多不常用多音字的简化（已合并到上面，避免重复）
  "露": ["lù"], // 只保留"露水"的读音，去掉"露脸"的lòu
};

/**
 * 获取汉字的拼音（小学阶段适用，保留常用多音字，简化不常用多音字）
 * @param char 汉字字符
 * @returns 拼音结果数组
 */
export function getPinyinForCharacter(char: string): PinyinResult[] {
  try {
    // 检查是否有预定义的小学阶段拼音
    if (primarySchoolPinyin[char]) {
      return primarySchoolPinyin[char].map(py => ({
        pinyin: py,
        tone: extractToneNumber(py)
      }));
    }

    // 使用 pinyin-pro 获取拼音，获取多音字但限制数量
    const pinyinWithTone = pinyin(char, {
      toneType: 'symbol',
      type: 'array',
      multiple: true
    });

    const pinyinWithNum = pinyin(char, {
      toneType: 'num',
      type: 'array',
      multiple: true
    });

    const results: PinyinResult[] = [];

    // 处理多音字情况，但最多取前2个最常用的读音
    if (Array.isArray(pinyinWithTone)) {
      const maxPinyin = Math.min(pinyinWithTone.length, 2); // 最多2个读音
      for (let i = 0; i < maxPinyin; i++) {
        const py = pinyinWithTone[i];
        const numPy = pinyinWithNum[i] || py;
        const tone = extractToneNumber(numPy);

        results.push({
          pinyin: py,
          tone: tone
        });
      }
    } else {
      // 单个拼音
      const firstPinyinWithNum = Array.isArray(pinyinWithNum) ? pinyinWithNum[0] : pinyinWithNum;
      const firstPinyinWithTone = Array.isArray(pinyinWithTone) ? pinyinWithTone[0] : pinyinWithTone;
      const tone = extractToneNumber(firstPinyinWithNum as string);
      results.push({
        pinyin: firstPinyinWithTone as string,
        tone: tone
      });
    }

    return results.length > 0 ? results : [{ pinyin: char, tone: 0 }];
  } catch (error) {
    console.error('获取拼音失败:', error);
    return [{ pinyin: char, tone: 0 }];
  }
}

/**
 * 从带数字的拼音中提取音调数字
 * @param pinyinWithNum 带数字的拼音，如 "han4"
 * @returns 音调数字 (1-4)，无音调返回 0
 */
function extractToneNumber(pinyinWithNum: string): number {
  const match = pinyinWithNum.match(/(\d)$/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * 获取汉字的所有可能拼音（多音字）
 * @param char 汉字字符
 * @returns 所有拼音的字符串数组
 */
export function getAllPinyinForCharacter(char: string): string[] {
  try {
    const results = getPinyinForCharacter(char);
    return results.map(result => result.pinyin);
  } catch (error) {
    console.error('获取所有拼音失败:', error);
    return [char];
  }
}

/**
 * 获取拼音的首字母
 * @param char 汉字字符
 * @returns 首字母
 */
export function getFirstLetter(char: string): string {
  try {
    const firstLetter = pinyin(char, { 
      pattern: 'first',
      toneType: 'none'
    });
    return firstLetter.toUpperCase();
  } catch (error) {
    console.error('获取首字母失败:', error);
    return char;
  }
}
