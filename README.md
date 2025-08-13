# Morphix AI 助手 - AI API 调用演示

一个简洁的 AI 对话应用，专为新手学习 AI API 调用而设计。基于 React + TypeScript + Tailwind CSS 构建，使用 OpenRouter API 连接多种 AI 模型。

## ✨ 功能特性

### 🎯 核心功能
- **三种对话模式**：普通对话、翻译、HTML 代码生成
- **实时对话**：支持流畅的 AI 对话交互
- **模式切换**：一键切换不同的 AI 助手模式
- **响应式设计**：完美适配桌面和移动端

### 🤖 AI 模式详解

#### 1. 普通模式 💬
- **功能**：通用 AI 助手，回答各种问题
- **特点**：友好对话，中文回答
- **适用**：日常咨询、学习辅助

#### 2. 翻译模式 🌐
- **功能**：专业翻译服务
- **特点**：只输出翻译结果，无额外解释
- **支持**：中英互译，自动语言识别

#### 3. HTML 模式 📄
- **功能**：生成 HTML 代码
- **特点**：输出干净的可运行 HTML 代码
- **包含**：完整的 HTML 结构和 CSS 样式

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **样式方案**：Tailwind CSS 4.x
- **构建工具**：Vite 5.x
- **AI 服务**：OpenAI SDK + OpenRouter API
- **代码规范**：ESLint + TypeScript ESLint

## 📦 项目结构

```
src/
├── components/           # React 组件
│   ├── ChatInterface.tsx # 主聊天界面
│   └── ModeSelector.tsx  # 模式选择器
├── config/              # 配置文件
│   └── ai.ts            # AI 配置和提示词
├── services/            # 服务层
│   └── aiService.ts     # AI API 服务
├── types/               # TypeScript 类型定义
│   └── index.ts         # 通用类型
├── utils/               # 工具函数
│   ├── apiHelpers.ts    # API 辅助工具
│   └── dateUtils.ts     # 日期工具
└── examples/            # 使用示例
    └── apiUsage.ts      # API 调用示例
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 配置 API Key
在 `src/config/ai.ts` 中配置你的 OpenRouter API Key：
```typescript
export const AI_CONFIG: AIConfig = {
  apiKey: 'your-openrouter-api-key',
  baseURL: 'https://openrouter.ai/api/v1',
  model: 'qwen/qwen3-coder:free',
  // ...
};
```

### 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 构建生产版本
```bash
npm run build
```

## 🎨 界面预览

### 桌面端
- 居中布局，最大宽度 4xl
- 清晰的模式选择器
- 简洁的消息气泡设计

### 移动端
- 响应式适配
- 触摸友好的按钮
- 紧凑的界面布局

## 🔧 核心代码示例

### 基本 AI 调用
```typescript
import { aiService } from './services/aiService';

// 发送消息
const response = await aiService.sendMessage({
  messages: [
    { role: 'user', content: '你好，请介绍一下 React' }
  ]
});

if (response.success) {
  console.log('AI 回复:', response.content);
}
```

### 模式切换
```typescript
import { getSystemPrompts } from './config/ai';

// 切换到翻译模式
const prompts = getSystemPrompts();
aiService.updateConfig({
  systemPrompt: prompts.translate.systemPrompt
});
```

### 代码助手工具
```typescript
import { CodeAssistant } from './utils/apiHelpers';

// 代码解释
const result = await CodeAssistant.explainCode(code, 'javascript');

// 代码审查
const review = await CodeAssistant.reviewCode(code, 'typescript');
```

## 📚 学习要点

### 1. AI API 集成
- OpenAI SDK 的使用方法
- 系统提示词的设计
- 错误处理和重试机制

### 2. React 最佳实践
- 函数组件和 Hooks
- 状态管理
- 组件通信

### 3. TypeScript 应用
- 类型定义和接口
- 泛型的使用
- 类型安全的 API 调用

### 4. 现代前端工具
- Vite 构建配置
- Tailwind CSS 样式系统
- ESLint 代码规范

## 🎯 适用场景

### 学习用途
- **AI 初学者**：了解 AI API 调用流程
- **前端开发者**：学习 React + TypeScript 项目结构
- **学生项目**：作为课程作业或毕业设计参考

### 扩展开发
- **企业应用**：可扩展为内部 AI 助手工具
- **产品原型**：快速验证 AI 功能想法
- **技术演示**：展示 AI 集成能力

## 🔄 自定义配置

### 添加新的 AI 模式
1. 在 `src/config/ai.ts` 中添加新模式配置
2. 定义系统提示词和占位符文本
3. 更新 TypeScript 类型定义

### 更换 AI 模型
```typescript
// 在 ai.ts 中修改模型配置
export const AI_CONFIG: AIConfig = {
  model: 'anthropic/claude-3-haiku:beta', // 更换模型
  temperature: 0.7, // 调整创造性
  maxTokens: 1500,  // 调整响应长度
};
```

### 自定义样式
项目使用 Tailwind CSS，可以轻松自定义：
- 修改颜色主题
- 调整布局间距
- 添加动画效果

## 📖 API 文档

### AIService 类
```typescript
class AIService {
  // 发送消息
  async sendMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse>
  
  // 更新配置
  updateConfig(newConfig: Partial<AIConfig>): void
  
  // 获取配置
  getConfig(): AIConfig
}
```

### 工具函数
```typescript
// 代码助手
CodeAssistant.explainCode(code, language)
CodeAssistant.reviewCode(code, language)
CodeAssistant.optimizeCode(code, language)

// 快速聊天
quickChat(prompt)

// 日期工具
getCurrentDateTime()
getDayOfWeek()
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [OpenRouter](https://openrouter.ai/) - 提供 AI API 服务
- [Qwen](https://qwenlm.github.io/) - 优秀的开源 AI 模型
- [React](https://react.dev/) - 强大的前端框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发起 Discussion
- 邮件联系

---

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**