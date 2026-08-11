const { textToSpeech } = require("../services/audio");

module.exports = {
    name: "voice",

    async execute(args, user) {
        const text = args.join(" ").trim();

        if (!text) {
            return "🔊 Please provide text for me to speak.";
        }

        const outputPath = `uploads/audio/isaac-${user.id}-${Date.now()}.wav`;

        await textToSpeech(text, outputPath);

        return {
            type: "audio",
            path: outputPath,
            message: "🔊 Isaac has generated your voice."
        };
    }
};
