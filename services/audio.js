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

/*
|--------------------------------------------------------------------------
| Speech To Text
|--------------------------------------------------------------------------
| Accepts a Buffer from multer.memoryStorage().
|--------------------------------------------------------------------------
*/

async function speechToText(audioBuffer, filename = "audio.wav") {

    if (!groq) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    const transcription = await groq.audio.transcriptions.create({
        file: new File(
            [audioBuffer],
            filename,
            { type: "audio/wav" }
        ),
        model: "whisper-large-v3-turbo"
    });

    return transcription.text;
}


/*
|--------------------------------------------------------------------------
| Text To Speech
|--------------------------------------------------------------------------
| Local file output is still supported for non-serverless environments.
|--------------------------------------------------------------------------
*/

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

    const buffer = Buffer.from(
        await response.arrayBuffer()
    );

    fs.writeFileSync(outputPath, buffer);

    return outputPath;
}


module.exports = {
    speechToText,
    textToSpeech
};
