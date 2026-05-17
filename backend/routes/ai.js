// backend/routes/ai.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const aiService = require('../services/aiService');

/**
 * POST /api/ai/draw
 * AI 绘图：根据自然语言描述生成图形元素
 * Body: { prompt: "画一个红色五角星在画布中央" }
 */
router.post('/draw',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ success: false, message: '缺少 prompt 参数' });
      }

      console.log('🎨 AI 绘图请求:', prompt);
      const elements = await aiService.generateDrawing(prompt);
      
      console.log('✅ AI 生成元素:', elements.length, '个');
      res.json({ success: true, elements });
    } catch (err) {
      console.error('❌ AI Draw Error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * POST /api/ai/chat
 * AI 聊天：智能助手对话
 * Body: { message: "帮我把白板清空了", context: {...}, history: [...] }
 */
router.post('/chat',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { message, context = {}, history = [] } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, message: '缺少 message 参数' });
      }

      console.log('💬 AI 聊天请求:', message);
      const result = await aiService.chat(message, context, history);
      
      console.log('✅ AI 回复:', result.type);
      res.json(result);
    } catch (err) {
      console.error('❌ AI Chat Error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * POST /api/ai/analyze
 * AI 图片分析：分析白板截图内容（多模态）
 * Body: { image: "base64字符串", prompt: "可选的自定义提示词" }
 */
router.post('/analyze',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { image, prompt } = req.body;

      if (!image || typeof image !== 'string') {
        return res.status(400).json({ success: false, message: '缺少 image 参数（base64）' });
      }

      console.log('🔍 AI 图片分析请求');
      const result = await aiService.analyzeImage(image, prompt);

      console.log('✅ AI 图片分析完成');
      res.json(result);
    } catch (err) {
      console.error('❌ AI Analyze Error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * GET /api/ai/health
 * 健康检查：测试 AI API 连通性
 */
router.get('/health', async (req, res) => {
  try {
    const hasKey = !!process.env.SILICONFLOW_API_KEY;
    if (!hasKey) {
      return res.status(503).json({
        status: 'unavailable',
        message: '未配置 SILICONFLOW_API_KEY'
      });
    }

    res.json({
      status: 'ok',
      message: 'Silicon Flow API 已配置',
      model: process.env.AI_MODEL || 'Qwen/Qwen2.5-VL-72B-Instruct'
    });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
