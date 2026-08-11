把每段旅行的照片放在这里。

推荐结构：
  seoul-2024/
    01.jpg
    02.jpg
    03.jpg

其中：
  文件夹名最好和 src/data/travels.personal.ts 里的 id 一致
  文件名按时间顺序排最省心

在 src/data/travels.personal.ts 里这样引用：
  photos: [
    { src: '/photos/seoul-2024/01.jpg', caption: '夜色里的街道', date: '2024-07-18' },
    { src: '/photos/seoul-2024/02.jpg', caption: '便利店补给' }
  ]

也支持 png、webp，以及 https:// 开头的外链图片。
