// backend/services/aiService.js
// 适配 Silicon Flow API（OpenAI 兼容格式，支持多模态）
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
});

const MODEL = process.env.AI_MODEL || 'Qwen/Qwen2.5-VL-72B-Instruct';

const DRAW_SYSTEM_PROMPT = `你是一个智能绘图助手，能够根据用户的自然语言描述生成精确的图形数据。

坐标系说明：
- 画布尺寸为 800x600（逻辑坐标）
- 左上角为 (0, 0)，右下角为 (800, 600)
- "中央" 约等于 (400, 300)

支持的图形类型及参数（严格 JSON 格式）：
1. circle: { "type": "circle", "x": 400, "y": 300, "radius": 50, "color": "#FF0000", "width": 2 }
2. rectangle: { "type": "rectangle", "x": 350, "y": 250, "width": 100, "height": 80, "color": "#0000FF", "strokeWidth": 2 }
3. square: { "type": "square", "x": 350, "y": 250, "size": 80, "color": "#00FF00", "strokeWidth": 2 }
4. ellipse: { "type": "ellipse", "x": 400, "y": 300, "radiusX": 60, "radiusY": 40, "color": "#FF00FF", "strokeWidth": 2 }
5. triangle: { "type": "triangle", "x": 400, "y": 300, "radius": 50, "color": "#FFA500", "strokeWidth": 2 }
6. star: { "type": "star", "x": 400, "y": 300, "numPoints": 5, "innerRadius": 20, "outerRadius": 50, "color": "#FFD700", "strokeWidth": 2 }
7. line: { "type": "line", "points": [100, 100, 300, 300], "lineType": "straight", "color": "#000000", "width": 2 }

颜色格式：十六进制，如 "#FF0000"（红）、"#0000FF"（蓝）
线条粗细：1-10 的整数

输出要求（非常重要）：
- 必须严格返回 JSON 数组，不要任何 markdown 代码块标记
- 不要包含任何解释文字
- 仅返回数组本身，例如：[{ "type": "circle", ... }]`;

const CHAT_SYSTEM_PROMPT = `你是一个智能白板助手，帮助用户更好地使用协作白板。保持友好、简洁的回答风格。

你可以执行的操作（在回复中用 [ACTION:xxx] 标记）：
- [ACTION:clearCanvas] - 清空白板
- [ACTION:toggleGrid] - 切换网格显示
- [ACTION:exportPNG] - 导出为 PNG
- [ACTION:exportPDF] - 导出为 PDF

回复规则：
- 如果用户请求执行操作，在回复末尾添加对应的 [ACTION:xxx] 标记
- 保持友好、简洁的回答风格
- 如果涉及创作建议，给出具体的改进方向`;

const VISION_SYSTEM_PROMPT = `你是一个视觉分析助手，能够分析白板图片内容并给出详细描述和总结。

你的能力：
1. 识别白板上的所有图形元素（圆形、矩形、线条、星形等）
2. 描述图形之间的关系和布局
3. 总结白板表达的主题或内容
4. 给出改进建议

请用中文回答，保持简洁但有信息量。`;

class AIService {
  constructor() {
    console.log('🤖 AI Service 初始化:');
    console.log('  模型:', MODEL);
    console.log('  BaseURL:', process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1');
    console.log('  API Key:', process.env.SILICONFLOW_API_KEY ? '已配置 ✅' : '未配置 ❌');
  }

  async generateDrawing(prompt) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: DRAW_SYSTEM_PROMPT },
          { role: 'user', content: `用户描述：${prompt}` },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      });

      const content = response.choices[0].message.content;

      // 清理可能的 markdown 代码块
      let cleaned = content.replace(/```json\n?|```\n?/g, '').trim();
      // 有时候模型会加文字说明，尝试提取 JSON 数组
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      const elements = JSON.parse(cleaned);

      if (!Array.isArray(elements)) {
        throw new Error('AI 返回的不是数组');
      }

      return elements.map((el) => this.normalizeElement(el));
    } catch (err) {
      console.error('AI generateDrawing error:', err.message);
      throw new Error('AI 生成图形失败：' + err.message);
    }
  }

  async chat(message, context = {}, history = []) {
    try {
      const messages = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...history.map((h) => ({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content,
        })),
      ];

      // 构建上下文提示
      let contextPrompt = '';
      if (context.roomId) contextPrompt += `当前房间ID: ${context.roomId}\n`;
      if (context.elementCount !== undefined)
        contextPrompt += `当前白板元素数量: ${context.elementCount}\n`;
      if (context.onlineUserCount !== undefined)
        contextPrompt += `在线用户数: ${context.onlineUserCount}\n`;

      const fullMessage = contextPrompt
        ? `[上下文]\n${contextPrompt}\n[用户消息]\n${message}`
        : message;

      messages.push({ role: 'user', content: fullMessage });

      const response = await client.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      const text = response.choices[0].message.content;

      // 尝试解析动作指令
      const actionMatch = text.match(/\[ACTION:\s*(\w+)\]/);
      if (actionMatch) {
        const action = actionMatch[1];
        const cleanText = text.replace(/\[ACTION:\s*\w+\]/, '').trim();
        return {
          type: 'action',
          action,
          message: cleanText || '已执行操作',
        };
      }

      return {
        type: 'text',
        content: text,
      };
    } catch (err) {
      console.error('AI chat error:', err.message);
      throw new Error('AI 聊天失败：' + err.message);
    }
  }

  // 多模态图片分析（新增）
  async analyzeImage(base64Image, prompt = '请分析这张白板图片的内容') {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: VISION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      });

      return {
        type: 'text',
        content: response.choices[0].message.content,
      };
    } catch (err) {
      console.error('AI analyzeImage error:', err.message);
      throw new Error('AI 图片分析失败：' + err.message);
    }
  }

  normalizeElement(el) {
    const defaults = {
      x: 400,
      y: 300,
      color: '#000000',
      width: 2,
    };

    const normalized = { ...defaults, ...el };

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
        normalized.points = el.points || [0, 0, 100, 100];
        normalized.lineType = el.lineType || 'straight';
        break;
    }

    return normalized;
  }
}

module.exports = new AIService();
