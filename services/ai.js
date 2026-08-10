const axios = require("axios");
require("dotenv").config();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function askAI(message) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return "🤖 Isaac George AI\n\nGroq API key is not configured.";
    }

    try {
        const response = await axios.post(
            GROQ_URL,
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are Isaac George AI, a helpful, intelligent and friendly AI assistant. Give clear, accurate and useful answers. Be concise unless the user asks for detail."
                    },
                    {
                        role: "user",
                        content: String(message || "").trim()
                    }
                ],
                temperature: 0.5,
                max_tokens: 700
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                timeout: 12000
            }
        );

        return (
            response.data?.choices?.[0]?.message?.content ||
            "❌ Groq returned no response."
        );

    } catch (error) {
        console.error(
            "❌ Groq API error:",
            error.response?.data || error.message
        );

        return "⚠️ Isaac is temporarily having trouble reaching the AI service. Please try again.";
    }
}

module.exports = {
    askAI
};
