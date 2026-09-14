const AIChatMessage = require('../models/AIChatMessage');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

const getChatHistory = async (req, res) => {
  try {
    const messages = await AIChatMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('AI chat history request failed:', error.message);
    return res.status(500).json({ message: 'Failed to load AI chat history.' });
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Please provide a message to the AI assistant.' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        message: 'AI is not configured. Add GEMINI_API_KEY to the backend .env file.',
      });
    }

    await AIChatMessage.create({
      user: req.user._id,
      role: 'user',
      content: message.trim().slice(0, 4000),
    });

    const safeHistory = Array.isArray(history)
      ? history
        .filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
        .slice(-10)
      : [];

    const contents = [
      ...safeHistory.map((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content.slice(0, 4000) }],
      })),
      { role: 'user', parts: [{ text: message.trim().slice(0, 4000) }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are the helpful TeamWep workplace assistant. Be concise, practical, and professional. Answer using your existing knowledge and the conversation context.' }],
          },
          contents,
          generationConfig: { maxOutputTokens: 700, temperature: 0.7 },
        }),
      },
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerError = data?.error || {};
      console.error('Gemini request failed:', providerError.message || response.statusText);

      return res.status(502).json({ message: `Gemini could not answer. Check the API key and model "${GEMINI_MODEL}".` });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join(' ');

    if (!reply) {
      return res.status(502).json({ message: 'The AI provider returned an empty response.' });
    }

    await AIChatMessage.create({
      user: req.user._id,
      role: 'assistant',
      content: reply,
    });

    return res.json({ reply });
  } catch (error) {
    console.error('AI request failed:', error.message);
    res.status(500).json({ message: 'AI request failed.' });
  }
};

module.exports = { chatWithAI, getChatHistory };
