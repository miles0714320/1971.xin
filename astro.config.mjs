import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// 1971.xin 站点配置：纯静态输出，无任何 SSR/适配器。
// site 必须写全，sitemap 和 canonical 都靠它生成。
export default defineConfig({
  site: "https://1971.xin",
  integrations: [sitemap()],
  build: {
    // 产物在 dist/，与 wrangler pages deploy dist 对齐
    format: "directory",
  },
  markdown: {
    // 关闭 Shiki 语法高亮：其默认 github-dark 会给 <pre> 打内联深色底，
    // 与本站亮色主题的深色文字叠加后对比度极低（深底深字）。
    // 关闭后代码块完全走 global.css 的 .prose pre / code 令牌，亮暗主题各自正确。
    syntaxHighlight: false,
  },
});
