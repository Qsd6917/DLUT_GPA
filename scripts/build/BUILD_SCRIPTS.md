# 构建脚本说明

## 脚本目录结构

```
scripts/
├── build/
│   ├── build.js              # 主构建脚本
│   ├── build-analyze.js      # 构建分析脚本
│   └── postbuild.js          # 构建后处理脚本
└── dev/
    ├── dev-server.js         # 开发服务器脚本
    └── watch.js              # 文件监听脚本
```

## 构建脚本

### build.js
主构建脚本，负责：
- 编译 TypeScript 代码
- 优化和压缩资源
- 生成生产版本
- 创建 PWA 清单文件

### build-analyze.js
构建分析脚本，用于：
- 分析包大小组成
- 识别性能瓶颈
- 优化建议生成

### postbuild.js
构建后处理脚本，负责：
- 生成版本文件
- 优化资源路径
- 准备部署文件

## 使用方法

### 标准构建
```bash
npm run build
```

### 分析构建
```bash
npm run build:analyze
```

### 开发构建
```bash
npm run dev
```

## 构建配置

构建配置文件位于项目根目录：
- `vite.config.ts` - Vite 构建配置
- `tsconfig.json` - TypeScript 配置
- `package.json` - 构建脚本定义

## 部署准备

构建完成后，生产文件位于 `dist/` 目录，包括：
- 静态 HTML、CSS、JS 文件
- PWA 相关文件
- 图标和资源文件
- 缓存清单文件

## 自定义构建

如需自定义构建过程，请修改 `vite.config.ts` 文件：
- 调整输出路径
- 修改插件配置
- 添加构建钩子
- 配置环境变量

## 性能优化

构建过程已启用以下优化：
- 代码分割
- Tree shaking
- 压缩和混淆
- 资源缓存
- 图像优化