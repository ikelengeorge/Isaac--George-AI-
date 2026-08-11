const Groq = require("groq-sdk");
const fs = require("fs");

const apiKey = process.env.GROQ_API_KEY;

let groq = null;

if (apiKey) {
    groq = new Groq({
        timeout: 120000,
        apiKey
    });
    console.log("🔊 Groq audio service enabled");
} else {
    console.log("⚠️ GROQ_API_KEY not configured — audio service disabled");
}

async function speechToText(filePath) {
    if (!groq) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3-turbo"
    });

    return transcription.text;
}

async function textToSpeech(text, outputPath) {
    if (!groq) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    const response = await groq.audio.speech.create({
        model: "canopylabs/orpheus-v1-english",
        voice: "hannah",
        input: text,
        response_format: "wav"
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
}

module.exports = {
    speechToText,
    textToSpeech
};
