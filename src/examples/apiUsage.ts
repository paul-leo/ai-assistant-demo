// AI API 使用示例

import { aiService } from '../services/aiService';
import { CodeAssistant, quickChat } from '../utils/apiHelpers';

// 示例 1: 基本聊天
export async function basicChatExample() {
  const response = await aiService.sendMessage({
    messages: [
      { role: 'user', content: '你好，请介绍一下React Hooks' }
    ]
  });

  if (response.success) {
    console.log('AI回复:', response.content);
  } else {
    console.error('错误:', response.error);
  }
}

// 示例 2: 代码解释
export async function codeExplanationExample() {
  const code = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`;

  const response = await CodeAssistant.explainCode(code, 'javascript');
  if (response.success) {
    console.log('代码解释:', response.content);
  }
}

// 示例 3: 代码审查
export async function codeReviewExample() {
  const code = `
function processUsers(users) {
  var result = [];
  for (var i = 0; i < users.length; i++) {
    if (users[i].age > 18) {
      result.push(users[i]);
    }
  }
  return result;
}
`;

  const response = await CodeAssistant.reviewCode(code, 'javascript');
  if (response.success) {
    console.log('代码审查:', response.content);
  }
}

// 示例 4: 修复Bug
export async function bugFixExample() {
  const code = `
function divide(a, b) {
  return a / b;
}

console.log(divide(10, 0)); // 问题：没有处理除零错误
`;

  const error = 'Division by zero error';
  const response = await CodeAssistant.fixBug(code, error, 'javascript');
  if (response.success) {
    console.log('修复建议:', response.content);
  }
}

// 示例 5: 生成代码
export async function codeGenerationExample() {
  const description = '创建一个React组件，显示用户列表，支持搜索和分页';
  
  const response = await CodeAssistant.generateCode(description, 'typescript');
  if (response.success) {
    console.log('生成的代码:', response.content);
  }
}

// 示例 6: 配置AI服务
export async function configurationExample() {
  // 获取当前配置
  const currentConfig = aiService.getConfig();
  console.log('当前配置:', currentConfig);

  // 更新配置
  aiService.updateConfig({
    temperature: 0.8,
    maxTokens: 1500,
    systemPrompt: '你是一个前端开发专家，专门回答React和TypeScript相关问题。'
  });

  // 使用新配置发送消息
  const response = await quickChat('如何优化React组件性能？');
  if (response.success) {
    console.log('使用新配置的回复:', response.content);
  }
}

// 示例 7: 错误处理
export async function errorHandlingExample() {
  try {
    const response = await aiService.sendMessage({
      messages: [{ role: 'user', content: '测试消息' }]
    });

    if (!response.success) {
      // 处理API错误
      switch (true) {
        case response.error?.includes('rate limit'):
          console.log('请求频率过高，请稍后重试');
          break;
        case response.error?.includes('quota'):
          console.log('API配额不足');
          break;
        case response.error?.includes('network'):
          console.log('网络连接问题');
          break;
        default:
          console.log('未知错误:', response.error);
      }
    }
  } catch (error) {
    console.error('意外错误:', error);
  }
}

// 示例 8: 流式响应 (可选功能)
export async function streamingExample() {
  const chunks: string[] = [];
  
  const response = await aiService.sendMessageStream(
    {
      messages: [{ role: 'user', content: '请详细解释TypeScript的类型系统' }]
    },
    (chunk) => {
      chunks.push(chunk);
      console.log('收到chunk:', chunk);
    }
  );

  if (response.success) {
    console.log('完整回复:', chunks.join(''));
  }
}
