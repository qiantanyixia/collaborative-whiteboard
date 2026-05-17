// backend/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DRAW_SYSTEM_PROMPT = `你是一个智能绘图助手，能够根据用户的自然语言描述生成精确的图形数据。

坐标系说明：
- 画布尺寸为 800x600（逻辑坐标）
- 左上角为 (0, 0)，右下角为 (800, 600)
- "中央" 约等于 (400, 300)
- "左上角" 约等于 (50, 50)

支持的图形类型及参数：
1. circle: { "type": "circle", x, y, radius, color, width }
2. rectangle: { "type": "rectangle", x, y, width, height, color, strokeWidth }
3. square: { "type": "square", x, y, size, color, strokeWidth }
4. ellipse: { "type": "ellipse", x, y, radiusX, radiusY, color, strokeWidth }
5. triangle: { "type": "triangle", x, y, radius, color, strokeWidth }
6. star: { "type": "star", x, y, numPoints, innerRadius, outerRadius, color, strokeWidth }
7. line: { "type": "line", points: [x1, y1, x2, y2], lineType: "straight|dashed|arrow", color, width }

颜色格式：十六进制，如 "#FF0000"（红）、"#0000FF"（蓝）、"#00FF00"（绿）
线条粗细：1-10 的整数

输出要求：
- 严格返回 JSON 数组格式，不要包含 markdown 代码块标记
- 不要包含任何解释文字
- 示例输出：[{ "type": "circle", "x": 400, "y": 300, "radius": 50, "color": "#FF0000", "width": 2 }]`;

const CHAT_SYSTEM_PROMPT = `你是一个智能白板助手，帮助用户更好地使用协作白板。保持友好、简洁的回答风格。

你可以执行的操作（通过 function_call）：
1. clearCanvas - 清空白板
2. toggleGrid - 切换网格显示
3. exportPNG - 导出为 PNG
4. exportPDF - 导出为 PDF

回复规则：
- 如果用户请求执行操作，使用 function_call
- 保持友好、简洁的回答风格
- 如果涉及创作建议，给出具体的改进方向`;

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      }
    });
  }

  async generateDrawing(prompt) {
    try {
      const result = await this.model.generateContent([
        { text: DRAW_SYSTEM_PROMPT },
        { text: `用户描述：${prompt}` }
      ]);
      const responseText = result.response.text();
      
      // 清理可能的 markdown 代码块
      const cleaned = responseText.replace(/```json\n?|```\n?/g, '').trim();
      const elements = JSON.parse(cleaned);
      
      // 验证并标准化元素
      return elements.map(el => this.normalizeElement(el));
    } catch (err) {
      console.error('Gemini generateDrawing error:', err.message);
      throw new Error('AI 生成图形失败：' + err.message);
    }
  }

  async chat(message, context = {}, history = []) {
    try {
      const chat = this.model.startChat({
        history: [
          { role: 'user', parts: [{ text: CHAT_SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: '明白了，我会作为白板助手帮助用户。' }] },
          ...history.map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          }))
        ]
      });

      // 构建上下文提示
      let contextPrompt = '';
      if (context.roomId) contextPrompt += `当前房间ID: ${context.roomId}\n`;
      if (context.elementCount !== undefined) contextPrompt += `当前白板元素数量: ${context.elementCount}\n`;
      if (context.onlineUserCount !== undefined) contextPrompt += `在线用户数: ${context.onlineUserCount}\n`;

      const fullMessage = contextPrompt ? `[上下文]\n${contextPrompt}\n[用户消息]\n${message}` : message;
      
      const result = await chat.sendMessage(fullMessage);
      const text = result.response.text();

      // 尝试解析动作指令
      const actionMatch = text.match(/\[ACTION:\s*(\w+)\]/);
      if (actionMatch) {
        const action = actionMatch[1];
        const cleanText = text.replace(/\[ACTION:\s*\w+\]/, '').trim();
        return {
          type: 'action',
          action,
          message: cleanText || '已执行操作'
        };
      }

      return {
        type: 'text',
        content: text
      };
    } catch (err) {
      console.error('Gemini chat error:', err.message);
      throw new Error('AI 聊天失败：' + err.message);
    }
  }

  normalizeElement(el) {
    // 确保所有必要字段存在
    const defaults = {
      x: 400,
      y: 300,
      color: '#000000',
      width: 2
    };
    
    const normalized = { ...defaults, ...el };
    
    // 类型特定处理
    switch (el.type) {
      case 'circle':
        normalized.radius = el.radius || 50;
        break;
      case 'rectangle':
        normalized.width = el.width || 100;
        normalized.height = el.height || 80;
        break;
      case 'square':
        normalized.size = el.size || 80;
        break;
      case 'ellipse':
        normalized.radiusX = el.radiusX || 60;
        normalized.radiusY = el.radiusY || 40;
        break;
      case 'triangle':
        normalized.radius = el.radius || 50;
        break;
      case 'star':
        normalized.numPoints = el.numPoints || 5;
        normalized.innerRadius = el.innerRadius || 20;
        normalized.outerRadius = el.outerRadius || 50;
        break;
      case 'line':
        normalized.points = el.points || [100, 100, 300, 300];
        normalized.lineType = el.lineType || 'straight';
        break;
    }

    return normalized;
  }
}

module.exports = new GeminiService();
