import { aiService } from '../services/aiService';
import type { Message } from '../types';

/**
 * 格式化消息历史，移除时间戳等UI相关信息
 */
export function formatMessagesForAPI(messages: Message[]) {
  return messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));
}

/**
 * 创建新的聊天消息
 */
export function createMessage(role: 'user' | 'assistant', content: string): Message {
  return {
    role,
    content,
    timestamp: new Date()
  };
}

/**
 * 快速发送单条消息（不考虑历史）
 */
export async function quickChat(prompt: string) {
  return await aiService.sendMessage({
    messages: [{ role: 'user', content: prompt }]
  });
}

/**
 * 代码相关的快速查询
 */
export class CodeAssistant {
  static async explainCode(code: string, language?: string) {
    const prompt = `请解释以下${language || ''}代码的功能：\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    return await quickChat(prompt);
  }

  static async reviewCode(code: string, language?: string) {
    const prompt = `请审查以下${language || ''}代码，指出潜在问题和改进建议：\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    return await quickChat(prompt);
  }

  static async optimizeCode(code: string, language?: string) {
    const prompt = `请优化以下${language || ''}代码的性能和可读性：\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    return await quickChat(prompt);
  }

  static async fixBug(code: string, error: string, language?: string) {
    const prompt = `以下${language || ''}代码出现了错误，请帮助修复：\n\n错误信息：${error}\n\n代码：\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    return await quickChat(prompt);
  }

  static async generateCode(description: string, language?: string) {
    const prompt = `请根据以下需求生成${language || ''}代码：\n\n${description}`;
    return await quickChat(prompt);
  }
}

/**
 * 错误处理工具
 */
export class ErrorHandler {
  static formatErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return '发生了未知错误';
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof Error && 
           (error.message.includes('network') || 
            error.message.includes('fetch') ||
            error.message.includes('timeout'));
  }

  static isQuotaError(error: unknown): boolean {
    return error instanceof Error && 
           (error.message.includes('quota') || 
            error.message.includes('rate limit'));
  }
}
