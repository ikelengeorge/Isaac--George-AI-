const https = require("https");

function searchWikipedia(query) {

    return new Promise((resolve, reject) => {

        const url =
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

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

                    if (response.statusCode !== 200) {

                        reject(
                            new Error(
                                `Wikipedia returned ${response.statusCode}`
                            )
                        );

                        return;
                    }

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


module.exports = {

    name: "wiki",

    description: "Search Wikipedia and get article summaries",

    async execute(args, account) {

        if (!args.length) {

            return (
                "📚 *Isaac Wikipedia*\n\n" +
                "Usage:\n" +
                "wiki <topic>\n\n" +
                "Examples:\n" +
                "wiki JavaScript\n" +
                "wiki Sierra Leone\n" +
                "wiki Albert Einstein"
            );
        }


        const topic =
            args.join(" ");


        try {

            const data =
                await searchWikipedia(topic);


            if (
                !data ||
                !data.extract
            ) {

                return (
                    `❌ No Wikipedia article found for "${topic}".`
                );
            }


            const title =
                data.title || topic;

            const summary =
                data.extract;

            const link =
                data.content_urls
                    ?.desktop
                    ?.page || "";


            return (
                `📚 *Isaac Wikipedia*\n\n` +

                `📖 ${title}\n\n` +

                `${summary}\n\n` +

                `${link
                    ? `🔗 ${link}`
                    : ""}`
            );


        } catch (error) {

            console.error(
                "❌ Wikipedia error:",
                error.message
            );

            return (
                "❌ Isaac could not access Wikipedia right now."
            );
        }
    }
};
