import OpenAI from 'openai';
import type { ChatCompletionRequest, ChatCompletionResponse, AIConfig, SearchRequest } from '../types';
import { AI_CONFIG, SEARCH_TOOL } from '../config/ai';
import { searchService } from './searchService';
import { getAMapTools, execMcpTool } from './aMapMcp';

export class AIService {
  private openai: OpenAI;
  private config: AIConfig;
  private amapTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];

  constructor(config: AIConfig = AI_CONFIG) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true
    });
    this.initializeAMapTools();
  }

  /**
   * 初始化高德地图工具
   */
  private async initializeAMapTools() {
    try {
      this.amapTools = await getAMapTools();
      console.log('高德地图工具已加载:', this.amapTools.length, '个工具');
    } catch (error) {
      console.error('加载高德地图工具失败:', error);
      this.amapTools = [];
    }
  }

  /**
   * 发送聊天消息到AI模型（支持工具调用）
   */
  async sendMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      // 添加系统提示词
      const messages = [
        { role: 'system' as const, content: this.config.systemPrompt },
        ...request.messages
      ];

      // 组合所有可用工具
      const allTools = [SEARCH_TOOL, ...this.amapTools];

      const response = await this.openai.chat.completions.create({
        model: request.model || this.config.model,
        messages: messages,
        max_tokens: request.max_tokens || this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        tools: allTools,
        tool_choice: 'auto'
      });

      const choice = response.choices[0];
      const message = choice?.message;

      if (!message) {
        throw new Error('AI响应为空');
      }

      // 检查是否有工具调用
      if (message.tool_calls && message.tool_calls.length > 0) {
        return await this.handleToolCalls(messages, message.tool_calls);
      }

      const content = message.content;
      
      if (!content) {
        throw new Error('AI响应内容为空');
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
   * 处理工具调用
   */
  private async handleToolCalls(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    toolCalls: any[]
  ): Promise<ChatCompletionResponse> {
    try {
      // 添加助手的工具调用消息
      const assistantMessage = {
        role: 'assistant' as const,
        content: null,
        tool_calls: toolCalls
      };

      // 处理每个工具调用
      const toolMessages = [];
      
      for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'info_search_web') {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const searchRequest: SearchRequest = {
              query: args.query,
              date_range: args.date_range || 'all'
            };
            
            const searchResult = await searchService.searchWeb(searchRequest);
            
            let toolResponse: string;
            if (searchResult.success) {
              toolResponse = searchService.formatSearchResults(searchResult.results);
            } else {
              toolResponse = `搜索失败: ${searchResult.error}`;
            }

            toolMessages.push({
              role: 'tool' as const,
              content: toolResponse,
              tool_call_id: toolCall.id
            });
            
          } catch (error) {
            console.error('工具调用解析错误:', error);
            toolMessages.push({
              role: 'tool' as const,
              content: '工具调用参数解析失败',
              tool_call_id: toolCall.id
            });
          }
        } else if (toolCall.function.name.startsWith('amap__')) {
          // 处理高德地图工具调用
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const toolName = toolCall.function.name.replace('amap__', '');
            
            const amapResult = await execMcpTool(toolName, args);
            
            let toolResponse: string;
            if (amapResult && amapResult.content) {
              if (Array.isArray(amapResult.content)) {
                toolResponse = amapResult.content.map((item: unknown) => 
                  typeof item === 'string' ? item : JSON.stringify(item, null, 2)
                ).join('\n');
              } else {
                toolResponse = typeof amapResult.content === 'string' 
                  ? amapResult.content 
                  : JSON.stringify(amapResult.content, null, 2);
              }
            } else {
              toolResponse = '高德地图工具调用成功，但未返回数据';
            }

            toolMessages.push({
              role: 'tool' as const,
              content: toolResponse,
              tool_call_id: toolCall.id
            });
            
          } catch (error) {
            console.error('高德地图工具调用错误:', error);
            toolMessages.push({
              role: 'tool' as const,
              content: `高德地图工具调用失败: ${error instanceof Error ? error.message : '未知错误'}`,
              tool_call_id: toolCall.id
            });
          }
        }
      }

      // 构建新的消息历史
      const newMessages = [
        ...messages,
        assistantMessage,
        ...toolMessages
      ];

      // 再次调用AI生成最终回复
      const finalResponse = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: newMessages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const finalContent = finalResponse.choices[0]?.message?.content;
      
      if (!finalContent) {
        throw new Error('AI最终响应为空');
      }

      return {
        content: finalContent,
        success: true
      };

    } catch (error) {
      console.error('工具调用处理错误:', error);
      return {
        content: '处理搜索请求时发生错误，请重试。',
        success: false,
        error: error instanceof Error ? error.message : '工具调用错误'
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
   * 流式响应 (支持工具调用)
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

      // 组合所有可用工具
      const allTools = [SEARCH_TOOL, ...this.amapTools];

      // 首先尝试非流式调用检查是否有工具调用
      const initialResponse = await this.openai.chat.completions.create({
        model: request.model || this.config.model,
        messages: messages,
        max_tokens: request.max_tokens || this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
        tools: allTools,
        tool_choice: 'auto'
      });

      const choice = initialResponse.choices[0];
      const message = choice?.message;

      if (!message) {
        throw new Error('AI响应为空');
      }

      // 如果有工具调用，先处理工具调用，然后流式返回最终结果
      if (message.tool_calls && message.tool_calls.length > 0) {
        // 先显示工具调用状态
        onChunk('🔍 正在搜索相关信息...\n\n');
        
        // 处理工具调用
        const toolResult = await this.handleToolCallsForStream(messages, message.tool_calls);
        if (!toolResult.success) {
          return {
            content: '',
            success: false,
            error: toolResult.error || '工具调用失败'
          };
        }

        // 使用工具调用结果进行流式响应
        const finalMessages = toolResult.messages || messages;
        
        const stream = await this.openai.chat.completions.create({
          model: request.model || this.config.model,
          messages: finalMessages,
          max_tokens: request.max_tokens || this.config.maxTokens,
          temperature: request.temperature ?? this.config.temperature,
          stream: true,
        });

        let fullContent = '🔍 正在搜索相关信息...\n\n';

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
      } else {
        // 没有工具调用，直接流式响应
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
      }

    } catch (error) {
      console.error('AI流式服务错误:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : '流式响应错误'
      };
    }
  }

  /**
   * 为流式响应处理工具调用
   */
  private async handleToolCallsForStream(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    toolCalls: any[]
  ): Promise<{ success: boolean; messages?: any[]; error?: string }> {
    try {
      const assistantMessage = {
        role: 'assistant' as const,
        content: null,
        tool_calls: toolCalls
      };

      const toolMessages = [];
      
      for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'info_search_web') {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const searchRequest: SearchRequest = {
              query: args.query,
              date_range: args.date_range || 'all'
            };
            
            const searchResult = await searchService.searchWeb(searchRequest);
            
            let toolResponse: string;
            if (searchResult.success) {
              toolResponse = searchService.formatSearchResults(searchResult.results);
            } else {
              toolResponse = `搜索失败: ${searchResult.error}`;
            }

            toolMessages.push({
              role: 'tool' as const,
              content: toolResponse,
              tool_call_id: toolCall.id
            });
            
          } catch (error) {
            console.error('工具调用解析错误:', error);
            toolMessages.push({
              role: 'tool' as const,
              content: '工具调用参数解析失败',
              tool_call_id: toolCall.id
            });
          }
        } else if (toolCall.function.name.startsWith('amap__')) {
          // 处理高德地图工具调用
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const toolName = toolCall.function.name.replace('amap__', '');
            
            const amapResult = await execMcpTool(toolName, args);
            
            let toolResponse: string;
            if (amapResult && amapResult.content) {
              if (Array.isArray(amapResult.content)) {
                toolResponse = amapResult.content.map((item: unknown) => 
                  typeof item === 'string' ? item : JSON.stringify(item, null, 2)
                ).join('\n');
              } else {
                toolResponse = typeof amapResult.content === 'string' 
                  ? amapResult.content 
                  : JSON.stringify(amapResult.content, null, 2);
              }
            } else {
              toolResponse = '高德地图工具调用成功，但未返回数据';
            }

            toolMessages.push({
              role: 'tool' as const,
              content: toolResponse,
              tool_call_id: toolCall.id
            });
            
          } catch (error) {
            console.error('高德地图工具调用错误:', error);
            toolMessages.push({
              role: 'tool' as const,
              content: `高德地图工具调用失败: ${error instanceof Error ? error.message : '未知错误'}`,
              tool_call_id: toolCall.id
            });
          }
        }
      }

      const finalMessages = [
        ...messages,
        assistantMessage,
        ...toolMessages
      ];

      return {
        success: true,
        messages: finalMessages
      };

    } catch (error) {
      console.error('流式工具调用处理错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '工具调用错误'
      };
    }
  }
}

// 创建默认实例
export const aiService = new AIService();
