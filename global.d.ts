// global.d.ts

// 告诉 TypeScript，我们正在为全局范围内的现有接口添加属性
declare global {
  // 找到 HTMLAudioElement 接口
  interface HTMLAudioElement {
    // 告诉它，这个接口上有一个可选的布尔类型属性叫做 playsInline
    playsInline?: boolean;
  }
}

// 添加一个空的 export {} 可以确保这个文件被当作一个模块处理，
// 这在某些 TypeScript 配置下是必需的。
export {};
