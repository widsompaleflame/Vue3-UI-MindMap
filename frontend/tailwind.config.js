/** @type {import('tailwindcss').Config} */
export default {
    // content 数组至关重要，它告诉 Tailwind 可以在哪些文件中找到类名
    // 如果路径不对，样式就不会生成
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}