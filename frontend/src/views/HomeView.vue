<script setup>
import { ref } from 'vue';
import {
  SparklesIcon,
  PlusIcon,
  ClockIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'; // 注意这里改用了 outline 风格图标，更精致
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/vue/24/solid';
import { useRouter } from 'vue-router';

//初始化页面参数
const text = ref('');
const isAnalyzing = ref(false);
const activeTab = ref('editor'); // 控制当前显示的是输入框还是导图
const router=useRouter();

// 模拟侧边栏历史记录数据
const historyList = ref([
  { id: 1, title: 'Django 架构分析', date: '2小时前' },
  { id: 2, title: 'Vue3 响应式原理', date: '昨天' },
  { id: 3, title: '2024年产品规划', date: '3天前' },
]);

const handleGenerate = () => {
  if (!text.value.trim()) return;
  isAnalyzing.value = true;
  // 模拟 AI 分析
  setTimeout(() => {
    isAnalyzing.value = false;
    // 这里未来会跳转到思维导图渲染组件
    alert('AI 分析完成！正在请求后端生成 JSON...');
  }, 1500);
};

const handleCreateNew= () =>{
  console.log("创建新的思维导图")
  router.push('/editor');
}
</script>

<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans">

    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300">
      <div class="h-16 flex items-center px-6 border-b border-slate-100">
        <SparklesSolidIcon class="w-6 h-6 text-blue-600 mr-2" />
        <span class="text-lg font-bold text-slate-800 tracking-tight">MindAI</span>
      </div>

      <div class="p-4">
        <button
            @click="handleCreateNew"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all font-medium text-sm">
          <PlusIcon class="w-5 h-5" />
          新建导图
        </button>
      </div>

      <div class="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
        <div class="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">最近记录</div>

        <div
            v-for="item in historyList"
            :key="item.id"
            class="group flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors"
        >
          <ClockIcon class="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate group-hover:text-slate-900">{{ item.title }}</p>
            <p class="text-xs text-slate-400">{{ item.date }}</p>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-slate-100">
        <button class="flex items-center gap-3 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors w-full px-2 py-2 rounded-md hover:bg-slate-50">
          <Cog6ToothIcon class="w-5 h-5" />
          设置
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col h-full relative overflow-hidden">

      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-bold text-slate-800">新建思维导图</h2>
          <span class="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Draft</span>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-400 mr-2">{{ text.length }} 字符</span>
        </div>
      </header>

      <div class="flex-1 p-4 bg-slate-50 overflow-hidden flex flex-col">

        <div class="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">

          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
            <div>
              <h3 class="font-bold text-slate-700">输入文章内容</h3>
              <p class="text-xs text-slate-400 mt-1">AI 将自动提取结构并生成可编辑的思维导图</p>
            </div>
            <div class="flex gap-2">
              <button class="p-2 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors" title="清空">
                <DocumentTextIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <textarea
              v-model="text"
              class="flex-1 w-full p-6 text-base text-slate-700 placeholder-slate-400 focus:outline-none resize-none leading-relaxed custom-scrollbar"
              placeholder="请在此处粘贴长文章、会议纪要或复杂的笔记内容..."
          ></textarea>

          <div class="p-4 border-t border-slate-100 bg-white flex justify-end items-center gap-4 flex-shrink-0 z-10">
            <span class="text-xs text-slate-400" v-if="text.length === 0">请输入内容以开始</span>
            <button
                @click="handleGenerate"
                :disabled="!text || isAnalyzing"
                class="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-blue-500/20"
            >
              <SparklesSolidIcon v-if="!isAnalyzing" class="w-5 h-5" />
              <svg v-else class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ isAnalyzing ? '正在深度分析...' : '一键生成导图' }}
            </button>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式，让侧边栏更精致 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 20px;
}
</style>