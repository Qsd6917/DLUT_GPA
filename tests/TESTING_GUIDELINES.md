# 测试配置和说明

## 当前测试布局

```text
src/
├── components/**/__tests__      # 组件测试
├── services/__tests__           # 服务测试
└── test/setup.ts                # Vitest 初始化

tests/
└── TESTING_GUIDELINES.md        # 测试约定说明
```

## 质量基线命令

```bash
npm run type-check
npm run lint
npm run test:run
npm run test:coverage
npm run build
```

## 测试技术栈

- Vitest
- React Testing Library
- jsdom

## 约定

- 新增业务逻辑优先补服务级或 hook 级测试。
- UI 测试优先验证用户可见行为，不优先快照。
- 没有启用独立的根目录 `unit/integration/e2e` 分层；需要时再引入，不预留空目录。
