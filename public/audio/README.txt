把每段旅行的环境音和 BGM 放在这里。

推荐结构：
  seoul-2024/
    ambient.mp3   (可选，先播 1~2 秒再渐变到 BGM)
    bgm.mp3

在 src/data/travels.personal.ts 里这样引用：
  music: {
    title: 'Song Name',
    artist: 'Artist',
    url: '/audio/seoul-2024/bgm.mp3',
    ambientUrl: '/audio/seoul-2024/ambient.mp3',
  }

支持格式：
  mp3
  wav
  ogg
  m4a
