const Groq = require("groq-sdk");
const fs = require("fs");

const groq = new Groq({
  timeout: 120000,
  apiKey: process.env.GROQ_API_KEY
});

async function speechToText(filePath) {
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3-turbo"
  });

  return transcription.text;
}

async function textToSpeech(text, outputPath) {
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
