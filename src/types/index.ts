export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean; // 标识是否正在流式接收
}

export interface ChatCompletionRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatCompletionResponse {
  content: string;
  success: boolean;
  error?: string;
}

export interface AIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

// 搜索工具相关类型
export interface SearchTool {
  type: "function";
  function: {
    name: "info_search_web";
    description: string;
    parameters: {
      type: "object";
      properties: {
        query: {
          type: "string";
          description: string;
        };
        date_range?: {
          type: "string";
          enum: ["all", "past_hour", "past_day", "past_week", "past_month", "past_year"];
          description: string;
        };
      };
      required: ["query"];
    };
  };
}

export interface SearchRequest {
  query: string;
  date_range?: "all" | "past_hour" | "past_day" | "past_week" | "past_month" | "past_year";
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  published_date?: string;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  error?: string;
}

export interface TavilyConfig {
  apiKey: string;
  baseURL: string;
}

// 高德地图相关类型
export interface AMapConfig {
  apiKey: string;
  baseURL: string;
}

export interface AMapTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required: string[];
    };
  };
}
