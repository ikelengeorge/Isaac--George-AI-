const https = require("https");

function translateText(text, source, target) {

    return new Promise((resolve, reject) => {

        const encodedText =
            encodeURIComponent(text);

        const url =
            `https://api.mymemory.translated.net/get` +
            `?q=${encodedText}` +
            `&langpair=${source}|${target}`;

        https.get(
            url,
            {
                headers: {
                    "User-Agent": "Isaac-George-AI/1.0"
                }
            },
            (response) => {

                let data = "";

                response.on("data", chunk => {
                    data += chunk;
                });

                response.on("end", () => {

                    try {

                        resolve(JSON.parse(data));

                    } catch (error) {

                        reject(error);

                    }

                });

            }
        ).on("error", reject);

    });
}


const languages = {

    english: "en",
    french: "fr",
    spanish: "es",
    portuguese: "pt",
    german: "de",
    italian: "it",
    arabic: "ar",
    chinese: "zh",
    japanese: "ja",
    korean: "ko",
    russian: "ru",
    swahili: "sw",
    yoruba: "yo",
    hausa: "ha",
    hindi: "hi"
};


function getLanguageCode(input) {

    const value =
        input.toLowerCase();

    return languages[value] || value;
}


module.exports = {

    name: "translate",

    description: "Translate text between languages",

    async execute(args, account) {

        if (args.length < 3) {

            return (
                "🌍 *Isaac Translator*\n\n" +

                "Usage:\n" +
                "translate <source> <target> <text>\n\n" +

                "Examples:\n" +
                "translate en fr hello\n" +
                "translate en es how are you\n" +
                "translate en ar good morning\n\n" +

                "Language names or ISO codes are supported.\n" +
                "Examples: en, fr, French, Spanish, Arabic"
            );
        }


        const source =
            getLanguageCode(args[0]);

        const target =
            getLanguageCode(args[1]);

        const text =
            args.slice(2).join(" ");


        if (!text.trim()) {

            return (
                "❌ Please provide text to translate."
            );
        }


        try {

            const result =
                await translateText(
                    text,
                    source,
                    target
                );


            if (
                !result ||
                !result.responseData
            ) {

                return (
                    "❌ Translation service did not return a result."
                );
            }


            const translated =
                result.responseData.translatedText;


            if (
                !translated ||
                translated.toUpperCase().includes(
                    "INVALID SOURCE LANGUAGE"
                )
            ) {

                return (
                    "❌ Translation failed. " +
                    "Please check the language codes."
                );
            }


            return (
                `🌍 *Isaac Translator*\n\n` +

                `📝 Original:\n${text}\n\n` +

                `🔤 From: ${source}\n` +

                `🎯 To: ${target}\n\n` +

                `✅ Translation:\n${translated}`
            );


        } catch (error) {

            console.error(
                "❌ Translation error:",
                error.message
            );

            return (
                "❌ Isaac could not translate the text right now."
            );
        }
    }
};
