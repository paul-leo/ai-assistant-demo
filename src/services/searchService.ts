import type { SearchRequest, SearchResponse, SearchResult, TavilyConfig } from '../types';
import { TAVILY_CONFIG } from '../config/ai';

export class SearchService {
  private config: TavilyConfig;

  constructor(config: TavilyConfig = TAVILY_CONFIG) {
    this.config = config;
  }

  /**
   * 搜索网页内容
   */
  async searchWeb(request: SearchRequest): Promise<SearchResponse> {
    try {
      const searchPayload = {
        api_key: this.config.apiKey,
        query: request.query,
        search_depth: "basic",
        include_answer: false,
        include_images: false,
        include_raw_content: false,
        max_results: 5,
        ...(request.date_range && request.date_range !== 'all' && {
          days: this.mapDateRangeToDays(request.date_range)
        })
      };

      const response = await fetch(`${this.config.baseURL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload)
      });

      if (!response.ok) {
        throw new Error(`搜索API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('搜索API返回数据格式错误');
      }

      const results: SearchResult[] = data.results.map((item: any) => ({
        title: item.title || '无标题',
        url: item.url || '',
        content: item.content || '无内容',
        published_date: item.published_date || undefined
      }));

      return {
        success: true,
        results
      };

    } catch (error) {
      console.error('搜索服务错误:', error);
      
      let errorMessage = '搜索失败';
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = '网络连接错误，请检查网络设置';
        } else if (error.message.includes('API')) {
          errorMessage = '搜索API服务错误';
        } else if (error.message.includes('quota')) {
          errorMessage = '搜索API配额不足';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        results: [],
        error: errorMessage
      };
    }
  }

  /**
   * 将日期范围映射为天数
   */
  private mapDateRangeToDays(dateRange: string): number {
    switch (dateRange) {
      case 'past_hour':
        return 1; // Tavily 最小单位是天，所以用1天
      case 'past_day':
        return 1;
      case 'past_week':
        return 7;
      case 'past_month':
        return 30;
      case 'past_year':
        return 365;
      default:
        return 30; // 默认30天
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<TavilyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  getConfig(): TavilyConfig {
    return { ...this.config };
  }

  /**
   * 格式化搜索结果为文本
   */
  formatSearchResults(results: SearchResult[]): string {
    if (results.length === 0) {
      return '没有找到相关搜索结果。';
    }

    let formatted = '搜索结果：\n\n';
    
    results.forEach((result, index) => {
      formatted += `${index + 1}. **${result.title}**\n`;
      formatted += `   来源: ${result.url}\n`;
      if (result.published_date) {
        formatted += `   发布日期: ${result.published_date}\n`;
      }
      formatted += `   内容摘要: ${result.content.substring(0, 200)}${result.content.length > 200 ? '...' : ''}\n\n`;
    });

    return formatted;
  }
}

// 创建默认实例
export const searchService = new SearchService();
