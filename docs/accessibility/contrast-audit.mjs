import contrast from 'wcag-contrast';
import fs from 'fs';

// 当前颜色定义
const currentColors = {
  light: {
    primary: '#005BAC',
    onPrimary: '#FFFFFF',
    surface: '#FFFFFF',
    background: '#F8FAFC',
    textMain: '#1E293B',
    textMuted: '#64748B'
  },
  dark: {
    primary: '#60A5FA',
    onPrimary: '#1F2937',
    surface: '#1F2937',
    background: '#111827',
    textMain: '#F3F4F6',
    textMuted: '#9CA3AF'
  }
};

// 需要检查的对比度组合
const combinations = [
  // 亮色模式组合
  { name: '亮色: text-main on background', foreground: currentColors.light.textMain, background: currentColors.light.background },
  { name: '亮色: text-main on surface', foreground: currentColors.light.textMain, background: currentColors.light.surface },
  { name: '亮色: text-muted on background', foreground: currentColors.light.textMuted, background: currentColors.light.background },
  { name: '亮色: text-muted on surface', foreground: currentColors.light.textMuted, background: currentColors.light.surface },
  { name: '亮色: primary on surface', foreground: currentColors.light.primary, background: currentColors.light.surface },
  { name: '亮色: on-primary on primary', foreground: currentColors.light.onPrimary, background: currentColors.light.primary },
  
  // 暗色模式组合
  { name: '暗色: text-main on background', foreground: currentColors.dark.textMain, background: currentColors.dark.background },
  { name: '暗色: text-main on surface', foreground: currentColors.dark.textMain, background: currentColors.dark.surface },
  { name: '暗色: text-muted on background', foreground: currentColors.dark.textMuted, background: currentColors.dark.background },
  { name: '暗色: text-muted on surface', foreground: currentColors.dark.textMuted, background: currentColors.dark.surface },
  { name: '暗色: primary on surface', foreground: currentColors.dark.primary, background: currentColors.dark.surface },
  { name: '暗色: on-primary on primary', foreground: currentColors.dark.onPrimary, background: currentColors.dark.primary },
];

console.log('WCAG对比度审计报告');
console.log('===================\n');

console.log('WCAG 2.1 AA 标准:');
console.log('- 正常文本: 对比度 ≥ 4.5:1');
console.log('- 大文本 (18pt+ 或 14pt+粗体): 对比度 ≥ 3:1');
console.log('- 交互元素: 对比度 ≥ 3:1\n');

let issues = [];

combinations.forEach(combo => {
  const ratio = contrast(combo.foreground, combo.background);
  const passesNormal = ratio >= 4.5;
  const passesLarge = ratio >= 3.0;
  
  console.log(`组合: ${combo.name}`);
  console.log(`  前景: ${combo.foreground}, 背景: ${combo.background}`);
  console.log(`  对比度: ${ratio.toFixed(2)}:1`);
  console.log(`  通过正常文本(4.5:1): ${passesNormal ? '✅' : '❌'}`);
  console.log(`  通过大文本(3:1): ${passesLarge ? '✅' : '❌'}`);
  
  if (!passesNormal) {
    issues.push({
      combination: combo.name,
      foreground: combo.foreground,
      background: combo.background,
      contrast: ratio.toFixed(2),
      requirement: '正常文本 (≥4.5:1)',
      passes: false
    });
  }
  
  console.log('');
});

console.log('问题总结:');
console.log('=========');
if (issues.length === 0) {
  console.log('✅ 所有颜色组合均满足WCAG AA标准！');
} else {
  console.log(`❌ 发现 ${issues.length} 个对比度问题:`);
  issues.forEach(issue => {
    console.log(`   - ${issue.combination}: 对比度 ${issue.contrast}:1 (要求: ${issue.requirement})`);
  });
}

// 保存审计结果到文件
const auditReport = {
  timestamp: new Date().toISOString(),
  currentColors,
  combinations: combinations.map(combo => {
    const ratio = contrast(combo.foreground, combo.background);
    const passesNormal = ratio >= 4.5;
    const passesLarge = ratio >= 3.0;
    return {
      ...combo,
      contrast: ratio.toFixed(2),
      passesNormal,
      passesLarge
    };
  }),
  issues
};

fs.writeFileSync('contrast-audit-report.json', JSON.stringify(auditReport, null, 2));
console.log('\n审计报告已保存到: contrast-audit-report.json');