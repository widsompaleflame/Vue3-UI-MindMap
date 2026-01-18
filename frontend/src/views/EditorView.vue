<script setup>
import { ref, onMounted,watch } from 'vue';
import {useRouter} from "vue-router";
import {Transformer} from "markmap-lib";
import {Markmap} from "markmap-view";
import {ArrowLeftIcon} from "@heroicons/vue/24/solid";

const router = useRouter();

//1.初始化一些默认数据(Markdown 格式)
const markdown = ref(`# 思维导图
## 核心概念 A
- 子节点1
- 子节点2
## 核心概念 B
- 想法1
  - 深入想法1
- 想法2
`);

const svgRef = ref(null);
let markmapInstance=null;
const transformer = new Transformer();

//2. 渲染导图的核心函数
const updateMarkmap = () => {
  if(!markmapInstance||!svgRef.value) return;

  //把Markdown文本转换成markmap需要的节点数据
  const {root}=transformer.transform(markdown.value);

  //让markmap重新渲染
  markmapInstance.setData(root);
  markmapInstance.fit();//自动缩放适配视图
};

onMounted(() => {
  //3. 创建一个markmap实例
  if (svgRef.value) {
    markmapInstance=Markmap.create(svgRef.value,null,null);
    updateMarkmap();
  }
});

//4. 监听markdown数据变化，重新渲染导图
watch(markdown,()=>{
  updateMarkmap();
})

const goBack = () => {
  router.push('/');
};
</script>

<template>
  <div class="h-screen flex flex-col bg-white">
    <div class="h-14 border-b flex items-center px-4 justify-between bg-white z-10">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeftIcon class="w-5 h-5 text-slate-600" />
        </button>
        <span class="font-bold text-slate-700">未命名导图</span>
        <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Draft</span>
      </div>
      <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition">
        保存导图
      </button>
    </div>

    <div class="flex-1 flex overflow-hidden">

      <div class="w-1/3 border-r bg-slate-50 flex flex-col">
        <div class="p-3 border-b text-xs text-slate-400 font-medium uppercase tracking-wider">
          大纲编辑 (Markdown)
        </div>
        <textarea
            v-model="markdown"
            class="flex-1 w-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-700"
            placeholder="使用 # 表示标题，- 表示列表..."
        ></textarea>
      </div>

      <div class="flex-1 relative bg-white">
        <svg ref="svgRef" class="w-full h-full"></svg>
      </div>

    </div>
  </div>
</template>

<style scoped>

</style>