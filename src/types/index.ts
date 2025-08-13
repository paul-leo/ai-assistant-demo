export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
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
