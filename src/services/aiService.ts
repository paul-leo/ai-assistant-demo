import OpenAI from 'openai';
import type { ChatCompletionRequest, ChatCompletionResponse, AIConfig } from '../types';
import { AI_CONFIG } from '../config/ai';

export class AIService {
  private openai: OpenAI;
  private config: AIConfig;

  constructor(config: AIConfig = AI_CONFIG) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * 发送聊天消息到AI模型
   */
  async sendMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      // 添加系统提示词
      const messages = [
        { role: 'system' as const, content: this.config.systemPrompt },
        ...request.messages
      ];

      const response = await this.openai.chat.completions.create({
        model: request.model || this.config.model,
        messages: messages,
        max_tokens: request.max_tokens || this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI响应为空');
      }

      return {
        content,
        success: true
      };

    } catch (error) {
      console.error('AI服务错误:', error);
      
      let errorMessage = '发生未知错误';
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = '请求过于频繁，请稍后再试';
        } else if (error.message.includes('insufficient_quota')) {
          errorMessage = 'API配额不足';
        } else if (error.message.includes('invalid_api_key')) {
          errorMessage = 'API密钥无效';
        } else if (error.message.includes('network')) {
          errorMessage = '网络连接错误，请检查网络设置';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        content: '',
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 如果API配置发生变化，重新初始化OpenAI客户端
    if (newConfig.apiKey || newConfig.baseURL) {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
        dangerouslyAllowBrowser: true
      });
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * 流式响应 (可选扩展功能)
   */
  async sendMessageStream(
    request: ChatCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<ChatCompletionResponse> {
    try {
      const messages = [
        { role: 'system' as const, content: this.config.systemPrompt },
        ...request.messages
      ];

      const stream = await this.openai.chat.completions.create({
        model: request.model || this.config.model,
        messages: messages,
        max_tokens: request.max_tokens || this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        stream: true,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk(content);
        }
      }

      return {
        content: fullContent,
        success: true
      };

    } catch (error) {
      console.error('AI流式服务错误:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : '流式响应错误'
      };
    }
  }
}

// 创建默认实例
export const aiService = new AIService();
