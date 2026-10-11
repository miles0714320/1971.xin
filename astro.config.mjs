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
});
