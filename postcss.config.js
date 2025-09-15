// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/nesting': {}, // 推荐用于 v4
    '@tailwindcss/postcss': {},         // 核心！
    'autoprefixer': {},        // 核心！
  },
}
