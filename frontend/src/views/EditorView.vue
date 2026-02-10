<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Transformer } from 'markmap-lib';
import { Markmap, loadCSS, loadJS } from 'markmap-view';
import * as d3 from 'd3'; // 用于主题颜色
import {
  ArrowLeftIcon,
  BoldIcon,
  ItalicIcon,
  CodeBracketIcon,
  VariableIcon, // 代表数学公式
  SwatchIcon    // 代表主题
} from '@heroicons/vue/24/outline';

const router = useRouter();
const textareaRef = ref(null);
const svgRef = ref(null);

// Markmap 实例与转换器
let markmapInstance = null;
const transformer = new Transformer();

// --- 初始数据 (包含数学公式和代码块演示) ---
const markdown = ref(`# 全功能导图
## 基础格式
- **加粗文本** (Ctrl+B)
- *斜体文本* (Ctrl+I)
## 高级语法
- 代码块:
\`\`\`js
console.log('Hello');
\`\`\`
- 数学公式:
  - 行内: $E=mc^2$
  - 块级: $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$$
## 快捷键
- Tab: 缩进
- Shift+Tab: 提升
`);

// --- 主题配置 ---
// 定义几种 D3 色阶作为主题
const themes = [
  { name: '经典蓝', color: d3.scaleOrdinal(d3.schemeCategory10) },
  { name: '活力橙', color: d3.scaleOrdinal(d3.schemePaired) },
  { name: '暗夜霓虹', color: d3.scaleOrdinal(d3.schemeDark2) },
  { name: '清新绿', color: d3.scaleOrdinal(d3.schemePastel1) },
];
const currentThemeIndex = ref(0);

// --- 核心逻辑 1: 渲染与资源加载 (支持数学/代码) ---
const updateMarkmap = async () => {
  if (!markmapInstance || !svgRef.value) return;

  // 1. 转换 Markdown
  const { root, features } = transformer.transform(markdown.value);

  // 2. 动态加载资源 (CSS/JS)
  // Markmap 会告诉我们需要哪些样式 (比如 katex.css, prism.css)
  const { styles, scripts } = transformer.getUsedAssets(features);
  if (styles) loadCSS(styles);
  if (scripts) {
    try {
      await loadJS(scripts, {
        getMarkmap: () => window.markmap, //有些版本的 loader 需要这个上下文
      });
    } catch (e) {
      console.warn('资源加载失败，可能是网络问题:', e);
    }
  };

  // 3. 只有当资源都加载好了,设置数据与选项
  markmapInstance.setData(root);

  // 4. 应用主题颜色
  const colorFn = themes[currentThemeIndex.value].color;
  markmapInstance.setOptions({
    color: (node) => colorFn(node.state.path), // 根据节点路径层级上色
    fitRatio: 0.95,
    //确保数学公式和代码块能够正常交互
    embedGlobalCSS: true,
  });

  markmapInstance.fit();
};

// --- 核心逻辑 2: 切换主题 ---
const cycleTheme = () => {
  currentThemeIndex.value = (currentThemeIndex.value + 1) % themes.length;
  updateMarkmap();
};

// --- 核心逻辑 3: 键盘快捷键与缩进 ---
const handleKeydown = (e) => {
  const textarea = textareaRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  // 1. 拦截 Tab (缩进/反缩进)
  if (e.key === 'Tab') {
    e.preventDefault();
    if (e.shiftKey) {
      // Shift + Tab: 反缩进
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      // 检查当前行首是否有2个空格
      if (value.substring(lineStart, lineStart + 2) === '  ') {
        markdown.value = value.substring(0, lineStart) + value.substring(lineStart + 2);
        nextTick(() => {
          textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 2);
        });
      }
    } else {
      // Tab: 缩进
      markdown.value = value.substring(0, start) + '  ' + value.substring(end);
      nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  }

  // 2. 拦截 Ctrl+B (加粗)
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    insertSyntax('**', '**');
  }

  // 3. 拦截 Ctrl+I (斜体)
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    insertSyntax('*', '*');
  }
};

// --- 辅助工具: 插入语法 ---
const insertSyntax = (prefix, suffix, placeholder = '') => {
  const textarea = textareaRef.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  const selected = value.substring(start, end) || placeholder;

  markdown.value = value.substring(0, start) +
      prefix + selected + suffix +
      value.substring(end);

  // 恢复焦点并选中刚才插入的内容
  nextTick(() => {
    textarea.focus();
    const newCursorPos = start + prefix.length;
    textarea.selectionStart = newCursorPos;
    textarea.selectionEnd = newCursorPos + selected.length;
  });
};

// --- 插入代码块和公式 ---
const insertCodeBlock = () => insertSyntax('\n```js\n', '\n```\n', 'console.log("Code");');
const insertMath = () => insertSyntax('$', '$', 'E=mc^2');

// --- 生命周期 ---
onMounted(async () => {
  //预加载KaTex(数学公式库)和Prism(代码高亮)
  loadCSS([
    'https://fastly.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css',
    'https://fastly.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css'
  ])

  if (svgRef.value) {
    // 创建实例
    markmapInstance = Markmap.create(svgRef.value, null, null);
    updateMarkmap();
  }
});

watch(markdown, updateMarkmap);

const goBack = () => router.push('/');
</script>

<template>
  <div class="h-screen flex flex-col bg-white">
    <div class="h-14 border-b flex items-center px-4 justify-between bg-white z-20 shadow-sm relative">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeftIcon class="w-5 h-5 text-slate-600" />
        </button>
        <span class="font-bold text-slate-700">全能导图编辑器</span>
        <span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-medium">Pro</span>
      </div>

      <div class="flex gap-2">
        <button
            @click="cycleTheme"
            class="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-sm text-slate-600 transition border"
        >
          <SwatchIcon class="w-4 h-4" />
          <span>主题: {{ themes[currentThemeIndex].name }}</span>
        </button>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition shadow-sm">
          保存
        </button>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">

      <div class="w-1/3 border-r bg-slate-50 flex flex-col flex-shrink-0 z-10">

        <div class="p-2 border-b bg-white flex flex-wrap gap-1">
          <div class="flex gap-1 pr-2 border-r">
            <button @click="insertSyntax('**', '**')" title="加粗 (Ctrl+B)" class="tool-btn">
              <BoldIcon class="w-4 h-4" />
            </button>
            <button @click="insertSyntax('*', '*')" title="斜体 (Ctrl+I)" class="tool-btn">
              <ItalicIcon class="w-4 h-4" />
            </button>
          </div>

          <div class="flex gap-1 px-2 border-r">
            <button @click="insertCodeBlock" title="插入代码块" class="tool-btn">
              <CodeBracketIcon class="w-4 h-4" />
            </button>
            <button @click="insertMath" title="插入公式" class="tool-btn">
              <VariableIcon class="w-4 h-4" />
            </button>
          </div>

          <span class="ml-auto text-xs text-slate-400 leading-7 px-2">
            Markdown 模式
          </span>
        </div>

        <textarea
            ref="textareaRef"
            v-model="markdown"
            @keydown="handleKeydown"
            class="flex-1 w-full p-4 bg-slate-50 outline-none resize-none font-mono text-sm leading-relaxed text-slate-700 focus:bg-white transition-colors"
            placeholder="输入 Markdown 内容..."
            spellcheck="false"
        ></textarea>
      </div>

      <div class="flex-1 relative bg-slate-50">
        <svg ref="svgRef" class="w-full h-full"></svg>

        <div class="absolute bottom-4 right-4 text-xs text-slate-400 bg-white/80 p-2 rounded backdrop-blur-sm pointer-events-none">
          缩放: 滚轮 / 移动: 拖拽
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 工具栏按钮通用样式 */
.tool-btn {
  @apply p-1.5 rounded hover:bg-slate-100 text-slate-600 transition active:scale-95 active:bg-slate-200;
}
</style>