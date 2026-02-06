import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    // 获取 Gemini 模型 (使用 gemini-2.0-flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 构建对话历史（Gemini 格式）
    const chatHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // 创建聊天会话
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // 系统提示词（作为第一条消息）
    const systemPrompt = `You are a helpful academic assistant helping students with their CGPA, courses, and academic planning. 
You should:
- Be friendly and encouraging
- Provide accurate academic advice
- Help with GPA calculations
- Suggest study strategies
- Assist with course planning
- Answer in a concise and clear manner

Always respond in a helpful, supportive tone.`;

    // 如果是第一条消息，加入系统提示
    let finalMessage = message;
    if (history.length === 0) {
      finalMessage = `${systemPrompt}\n\nStudent question: ${message}`;
    }

    // 发送消息并获取响应
    const result = await chat.sendMessage(finalMessage);
    const response = await result.response;
    const aiResponse = response.text();

    return NextResponse.json({ message: aiResponse });
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // 更详细的错误处理
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `AI Error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}