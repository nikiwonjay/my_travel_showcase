# My Travel Showcase

一个以 3D 地球和时间线展示旅行回忆的 React 网页项目。

> 这是公开展示版。仓库仅包含虚构示例数据和本地示例图片，不包含真实旅行记录、个人照片、音乐、留言或 Supabase 凭据。

## 演示视频

[▶️ 直接播放项目演示视频](https://raw.githubusercontent.com/nikiwonjay/my_travel_showcase/main/demo/my-travel-demo.mp4)

## 主要功能

- 3D 地球路线与旅行地点展示
- 时间线浏览模式
- 旅行详情、心情标签与同行伙伴
- 照片画廊和大图预览
- 新建、编辑和删除旅程
- 音乐播放支持
- 随机回忆功能
- 可选 Supabase 云端存储
- 云端超时重试与本地缓存保护

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 可选的 Supabase 配置

公开展示版默认直接使用 `src/data/travels.demo.ts`，无需连接数据库。

如需启用自己的 Supabase，在项目根目录创建 `.env.local`：

```env
VITE_SUPABASE_URL=你的_Supabase_项目地址
VITE_SUPABASE_PUBLISHABLE_KEY=你的_Supabase_Publishable_Key
```

请为数据库表开启 RLS，并正确配置 Storage 访问策略。不要把私密密钥或个人数据提交到公开仓库。

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- Three.js / Globe.gl
- Framer Motion
- Supabase

## 隐私说明

本仓库是从私人项目制作的脱敏展示副本。所有真实旅行内容继续保留在原私有仓库中。
