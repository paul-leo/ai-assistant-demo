import type { AIConfig, TavilyConfig, SearchTool } from '../types';
import { getCurrentDateTime, getDayOfWeek } from '../utils/dateUtils';

export const AI_CONFIG: AIConfig = {
  apiKey: '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',
  baseURL: 'https://openrouter.ai/api/v1',
  model: 'qwen/qwen3-coder:free',
  maxTokens: 2000,
  temperature: 0.3,
  systemPrompt: '你是一个专业的编程助手，擅长代码编写、调试和技术问题解答。请用中文回答问题。'
};

// Tavily 搜索配置
export const TAVILY_CONFIG: TavilyConfig = {
  apiKey: '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',
  baseURL: 'https://api.tavily.com'
};

// 搜索工具定义
export const SEARCH_TOOL: SearchTool = {
  type: "function",
  function: {
    name: "info_search_web",
    description: "使用搜索引擎搜索网页内容，用于获取最新信息或查找参考资料。",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "搜索关键词，使用Google搜索风格，建议3-5个关键词。"
        },
        date_range: {
          type: "string",
          enum: ["all", "past_hour", "past_day", "past_week", "past_month", "past_year"],
          description: "（可选）搜索结果的时间范围筛选。可选值：all-全部，past_hour-过去1小时，past_day-过去1天，past_week-过去1周，past_month-过去1月，past_year-过去1年。"
        }
      },
      required: ["query"]
    }
  }
};

// 获取系统提示词的函数
export function getSystemPrompts() {
  const currentTime = getCurrentDateTime();
  const dayOfWeek = getDayOfWeek();
  const timeInfo = `当前时间: ${currentTime} ${dayOfWeek}`;
  
  return {
    normal: {
      id: 'normal',
      name: '普通模式',
      systemPrompt: `你是 Morphix 助手，一个有用的AI助手。${timeInfo}。你可以使用搜索工具获取最新信息来回答用户问题。当用户询问需要最新信息、实时数据或具体事实时，请主动使用搜索功能。请用中文回答问题，保持简洁友好的语调。`,
      placeholder: '输入你的问题...'
    },
    translate: {
      id: 'translate',
      name: '翻译模式',
      systemPrompt: `你是专业翻译助手。${timeInfo}。重要规则：你只能输出翻译结果，不能有任何其他内容，不能有解释、问候语或任何额外文字。用户输入什么语言，你就翻译成对应的目标语言。中文翻译成英文，英文翻译成中文，其他语言自动识别并翻译成中文。`,
      placeholder: '输入需要翻译的文本...'
    },
    html: {
      id: 'html',
      name: 'HTML模式',
      systemPrompt: `你是HTML代码助手。${timeInfo}。重要规则：你只能输出干净的HTML代码，不能有任何解释文字或markdown格式。直接输出可以运行的HTML代码，包含必要的CSS样式。`,
      placeholder: '描述你想要的HTML内容...'
    }
  } as const;
}

// 预设提示词模式
export const PROMPT_MODES = getSystemPrompts();

export type PromptModeId = keyof typeof PROMPT_MODES;

// 可用的模型列表
export const AVAILABLE_MODELS = [
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen Coder (Free)',
    description: '专业的编程助手模型'
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 (Free)',
    description: '通用对话模型'
  },
  {
    id: 'anthropic/claude-3-haiku:beta',
    name: 'Claude 3 Haiku',
    description: '快速响应的AI助手'
  }
] as const;
