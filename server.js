const express = require("express");
const multer = require("multer");
require("dotenv").config();
const axios = require("axios");
const path = require("path");

const { routeAI } = require("./services/aiRouter");
const pluginManager = require("./services/plugins/pluginManager");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// MIDDLEWARE
// ==============================

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({
    extended: true
}));

// ==============================
// STATIC WEBSITE
// ==============================

app.use(express.static(
    path.join(__dirname, "public")
));

// ==============================
// PLUGIN INITIALIZATION
// ==============================

pluginManager.loadPlugins();

// ==============================
// BASIC API
// ==============================

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        name: "Isaac George AI",
        version: "1.0.0",
        status: "online",
        plugins: pluginManager.getStatus()
    });

});

// ==============================
// PLUGIN LIST
// ==============================

app.get("/api/plugins", (req, res) => {

    res.json({
        success: true,
        plugins: pluginManager.getStatus()
    });

});

// ==============================
// HEALTH CHECK
// ==============================

app.get("/health", (req, res) => {

    res.json({
        success: true,
        status: "healthy"
    });

});


// ==============================
// CHAT API
// ==============================


// ==============================
// AUDIO / SPEECH-TO-TEXT API
// ==============================

const { speechToText } = require("./services/audio.js");

// Vercel/serverless-safe audio upload
// Keep audio in memory instead of writing to uploads/audio/
const uploadAudio = multer({
    storage: multer.memoryStorage()
});

app.post("/audio", uploadAudio.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Audio file is required"
            });
        }

        const text = await speechToText(req.file.buffer, req.file.originalname);

        return res.json({
            success: true,
            text
        });

    } catch (error) {
        console.error("Audio error:", error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/chat", async (req, res) => {

    try {

        const message = String(
            req.body?.message || ""
        ).trim();

        if (!message) {

            return res.status(400).json({
                success: false,
                error: "Message is required"
            });

        }

        // MEDIA COMMANDS
    const media = {
        ".nano": "image/edit",
        ".pixai": "image/generate",
        ".videofx": "video/edit",
        ".videogen": "video/generate"
    };

    const cmd = Object.keys(media).find(c => message.startsWith(c + " "));
    if (cmd) {
        return res.json({
            success: true,
            command: cmd,
            action: media[cmd],
            prompt: message.slice(cmd.length).trim(),
            status: "ready"
        });
    }

    const reply = await routeAI(message);

        return res.json({
            success: true,
            reply: reply
        });

    } catch (error) {

        console.error(
            "❌ Chat API error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Chat API error"
        });

    }

});


// ==============================
// MEDIA AI API
// ==============================

// IMAGE GENERATION
app.post("/api/ai/image/generate", async (req, res) => {
    try {
        const prompt = String(req.body?.prompt || req.body?.message || "").trim();

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "Prompt is required"
            });
        }

        const key = process.env.JOURNEY_API_KEY;

        if (!key) {
            return res.status(500).json({
                success: false,
                error: "JourneyAPI key is not configured"
            });
        }

        const response = await axios.post(
            "https://api.journeyapi.co/v1/imagine",
            { prompt },
            {
                headers: {
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({
            success: true,
            command: ".pixai",
            provider: "JourneyAPI",
            result: response.data
        });

    } catch (error) {
        console.error(
            "❌ PixAI error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            error: "Image generation failed"
        });
    }
});

app.post("/api/ai/image/edit", async (req, res) => {

    try {

        const { instruction } = req.body;

        if (!instruction) {
            return res.status(400).json({
                success: false,
                error: "Editing instruction is required"
            });
        }

        return res.json({
            success: false,
            type: "image-editing",
            message: "Image editing API is ready but no provider is connected yet.",
            instruction: instruction
        });

    } catch (error) {

        console.error("❌ Image editing error:", error);

        return res.status(500).json({
            success: false,
            error: "Image editing API error"
        });

    }

});


// VIDEO GENERATION
app.post("/api/ai/video/generate", async (req, res) => {

    try {

        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "Prompt is required"
            });
        }

        return res.json({
            success: false,
            type: "video-generation",
            message: "Video generation API is ready but no provider is connected yet.",
            prompt: prompt
        });

    } catch (error) {

        console.error("❌ Video generation error:", error);

        return res.status(500).json({
            success: false,
            error: "Video generation API error"
        });

    }

});


// VIDEO EDITING
app.post("/api/ai/video/edit", async (req, res) => {

    try {

        const { instruction } = req.body;

        if (!instruction) {
            return res.status(400).json({
                success: false,
                error: "Editing instruction is required"
            });
        }

        return res.json({
            success: false,
            type: "video-editing",
            message: "Video editing API is ready but no provider is connected yet.",
            instruction: instruction
        });

    } catch (error) {

        console.error("❌ Video editing error:", error);

        return res.status(500).json({
            success: false,
            error: "Video editing API error"
        });

    }

});

// ==============================
// START SERVER
// ==============================

if (require.main === module) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log("");
        console.log("=================================");
        console.log("🤖 ISAAC GEORGE AI WEB SERVER");
        console.log("=================================");
        console.log(`🌐 Port: ${PORT}`);
        console.log("🔌 Plugin system: enabled");
        console.log("📡 API: enabled");
        console.log("=================================");
        console.log("");
    });
}

module.exports = app;
