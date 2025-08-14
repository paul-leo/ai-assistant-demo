import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

import { OpenAI } from 'openai';

const CLIENT_CACHE: Record<string, Client> = {};
async function getAMapMcpClient() {
    if (CLIENT_CACHE['amap']) {
        return CLIENT_CACHE['amap'];
    }
    const client = new Client({
        name: 'name',
        version: '1.0.0',
    });
    const sseTransport = new SSEClientTransport(
        new URL('https://mcp.amap.com/sse?key=4255b4842e2cc1ce73cd905bd801cafc')
    );
    await client.connect(sseTransport);
    CLIENT_CACHE['amap'] = client;
    return client;
}

export async function getAMapTools() {
    const client = await getAMapMcpClient();
    const tools = await client.listTools();
    if (!tools || !Array.isArray(tools)) {
        return [];
    }
    const openaiTools = tools.map((tool: any) =>
        convertToolFormat(tool, 'amap')
    );
    console.log(openaiTools);
    return openaiTools;
}

export function convertToolFormat(
    tool: any,
    mcpName: string
): OpenAI.Chat.Completions.ChatCompletionTool {
    return {
        type: 'function',
        function: {
            name: `${mcpName}__${tool.name}`,
            description: tool.description,
            parameters: {
                type: 'object',
                properties: tool.inputSchema.properties,
                required: tool.inputSchema.required,
            },
        },
    };
}

export async function execMcpTool(toolName: string, args: Record<string, unknown>) {
    const client = await getAMapMcpClient();
    const result = await client.callTool({
        name: toolName,
        arguments: args,
    });
    return result;
}

export default getAMapMcpClient;
