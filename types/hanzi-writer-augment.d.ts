// types/hanzi-writer-augment.d.ts

// 1. 定义 HanziWriter *实例* 的接口
// 这个接口描述了通过 `new HanziWriter()` 或 `HanziWriter.create()` 创建的对象所拥有的属性和方法。
export interface HanziWriterInstance {
  cancelCharacter(): void;
  hide(): void;
  showCharacter(): void;
  hideCharacter(): void;
  showOutline(): void;
  animateCharacter(options?: { onComplete?: () => void; onStart?: () => void; errorColor?: string; duration?: number; delay?: number }): void;
  quiz(options?: { onComplete?: () => void; onCorrectStroke?: () => void; onMistake?: () => void; showOutline?: boolean; strokeColor?: string; outlineColor?: string; drawingColor?: string; strokeWidth?: number }): void;
  _options: {
    char: string;
    delayBetweenLoops: number;
    [key: string]: any;
  };
}

// 2. 增强 'hanzi-writer' 模块的声明
// 这里我们直接定义了当你 `import HanziWriter from 'hanzi-writer'` 时，
// `HanziWriter` 这个变量本身的类型。
declare module 'hanzi-writer' {
  // `HanziWriter` 是一个构造函数，它接受参数并返回 `HanziWriterInstance`。
  // 同时，它自己也有一个静态方法 `create`，也返回 `HanziWriterInstance`。
  // 这种结构直接模拟了 HanziWriter 库的 JavaScript 导出行为。
  class HanziWriter { // 使用 class 关键字更贴近 JS 构造函数
    constructor(element: string | HTMLElement, char: string, options?: any);
    static create(element: string | HTMLElement, char: string, options?: any): HanziWriterInstance;
    // 如果 HanziWriter 有其他静态属性或方法，也在这里声明，例如：
    // static isCharInFont(char: string): boolean;

    // 为了让 HanziWriter 的实例方法在 `writerInstanceRef.current` 上可用，
    // 我们还需要把 HanziWriterInstance 的成员直接合并到这个 HanziWriter Class 的类型中。
    // 这是一种 hacky 但在 d.ts 中经常用于融合构造函数和实例类型的方法。
    // ...HanziWriterInstance 是错误的语法，我们应该使用 implements, 但在这里 d.ts 合并可能更直接
    // 另一种方法是直接将 HanziWriterInstance 的属性声明在这里，但这会重复代码
    // 最好的方法是确保 HanziWriterInstance 只是一个接口，然后 HanziWriter 类实现了它。
    // 但因为我们是在 declare module 中，所以可以更直接地声明其构造函数和静态方法。
    // 实际 `HanziWriterInstance` 的方法将通过 `writerInstanceRef.current` 访问。

    // 在模块内部，我们只需声明默认导出为这个“类”的类型。
    // 这里的 `export = HanziWriter;` 是一种 CommonJS-compatible 的导出方式。
    // 但在现代 TS/ESM 环境下，`export default` 通常会映射到这种。
  }

  // 实际上，为了让 `import HanziWriter from 'hanzi-writer'` 正确工作，
  // 且 `HanziWriter.create` 返回 `HanziWriterInstance`，
  // 最直接的办法是让 `declare module 'hanzi-writer'` 的默认导出类型就是这个拥有 `create` 方法的“类”。
  // 让我们尝试经典的 `export =` 声明，因为它非常适合 CommonJS 库。
  export = HanziWriter;
}
