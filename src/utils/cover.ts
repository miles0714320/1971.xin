// 封面卡工具：根据字符串稳定派生渐变背景与首字水印。
// 用于「封面卡 + 内容流」风格，无需为每篇文章准备真实封面图。
// 渐变均保证白字可读（亮色/暗色主题下都清晰）。

const GRADIENTS: string[] = [
  "linear-gradient(135deg, #1a66e0 0%, #0a2a6b 100%)",
  "linear-gradient(135deg, #e0552b 0%, #7a1f0a 100%)",
  "linear-gradient(135deg, #0f9d8a 0%, #053b34 100%)",
  "linear-gradient(135deg, #7b4ddb 0%, #2e1065 100%)",
  "linear-gradient(135deg, #d4a017 0%, #6b4e00 100%)",
  "linear-gradient(135deg, #2b2b2b 0%, #0a0a0a 100%)",
];

export function coverGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

export function coverGlyph(title: string): string {
  const t = title.trim();
  return t ? t[0] : "✦";
}
