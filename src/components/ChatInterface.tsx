import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { aiService } from '../services/aiService';

import { ModeSelector } from './ModeSelector';
import { getSystemPrompts, type PromptModeId } from '../config/ai';

export const ChatInterface: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<PromptModeId>('normal');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 Morphix 助手，这是一个 AI API 调用演示。有什么可以帮助你的吗？',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleModeChange = (mode: PromptModeId) => {
    setCurrentMode(mode);
    
    // 获取最新的系统提示词（包含当前时间）
    const currentPrompts = getSystemPrompts();
    
    // 更新AI服务的系统提示词
    aiService.updateConfig({
      systemPrompt: currentPrompts[mode].systemPrompt
    });
    
    // 更新欢迎消息
    const welcomeMessages = {
      normal: '你好！我是 Morphix 助手，这是一个 AI API 调用演示。有什么可以帮助你的吗？',
      translate: '翻译模式已启用。请输入需要翻译的文本。',
      html: 'HTML模式已启用。请描述你想要的HTML内容。'
    };
    
    setMessages([{
      role: 'assistant',
      content: welcomeMessages[mode],
      timestamp: new Date()
    }]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // 准备发送给AI的消息历史
      const chatMessages = messages
        .filter(msg => msg.role !== 'system') // 过滤掉系统消息
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // 添加当前用户消息
      chatMessages.push({
        role: 'user',
        content: currentInput
      });

      // 调用AI服务
      const response = await aiService.sendMessage({
        messages: chatMessages
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.success 
          ? response.content 
          : `❌ ${response.error || '抱歉，我遇到了一些问题，请重试。'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('发送消息时出错:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ 抱歉，发生了意外错误。请检查网络连接并重试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">Morphix 助手</h1>
            <p className="text-blue-100 mt-1 text-sm">AI API 调用演示</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white">在线</span>
          </div>
        </div>
        
        {/* Mode Selector */}
        <ModeSelector 
          currentMode={currentMode} 
          onModeChange={handleModeChange} 
        />
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-sm sm:max-w-md md:max-w-lg lg:max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 sm:space-x-3`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-600 ml-2' 
                    : 'bg-gray-600 mr-2'
                }`}>
                  {message.role === 'user' ? '我' : 'AI'}
                </div>
                
                {/* Message Bubble */}
                <div className={`relative px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  <div className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Typing Indicator */}
        {isLoading && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-3xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm mr-2">
                  AI
                </div>
                <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-400"></div>
                    <span className="text-gray-500 text-xs sm:text-sm ml-2">正在思考...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="bg-white border-t border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-stretch space-x-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
                              placeholder={getSystemPrompts()[currentMode].placeholder}
              disabled={isLoading}
              rows={1}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
            <button 
              onClick={sendMessage} 
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-white disabled:opacity-50 transition-colors"
            >
              {isLoading ? '发送中...' : '发送'}
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};
