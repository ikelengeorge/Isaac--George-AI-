const https = require("https");

function fetchUrl(url) {
    return new Promise((resolve, reject) => {

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

                    if (
                        response.statusCode >= 300 &&
                        response.statusCode < 400 &&
                        response.headers.location
                    ) {
                        resolve({
                            redirect: response.headers.location
                        });

                        return;
                    }

                    resolve({
                        status: response.statusCode,
                        data
                    });

                });

            }
        ).on("error", reject);
    });
}


function cleanHtml(html) {

    return html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
}


module.exports = {

    name: "web",

    description: "Access information from the internet",

    async execute(args, account) {

        if (!args.length) {

            return (
                "🌐 *Isaac Web*\n\n" +
                "Usage:\n" +
                "web search <query>\n" +
                "web <URL>\n\n" +
                "Examples:\n" +
                "web search JavaScript\n" +
                "web https://example.com"
            );
        }


        const action = args[0].toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | Web Search
        |--------------------------------------------------------------------------
        */

        if (action === "search") {

            const query = args
                .slice(1)
                .join(" ")
                .trim();

            if (!query) {

                return (
                    "❌ Please enter something to search.\n\n" +
                    "Example:\n" +
                    "web search JavaScript"
                );
            }


            try {

                const encoded = encodeURIComponent(query);

                const url =
                    `https://api.duckduckgo.com/?q=${encoded}` +
                    `&format=json&no_html=1&skip_disambig=1`;

                const result = await fetchUrl(url);

                const data = JSON.parse(result.data);


                let response =
                    `🌐 *Isaac Web Search*\n\n` +
                    `🔎 ${query}\n\n`;


                if (data.AbstractText) {

                    response +=
                        `📖 ${data.AbstractText}\n\n`;

                }


                if (data.AbstractURL) {

                    response +=
                        `🔗 ${data.AbstractURL}\n\n`;

                }


                if (
                    data.RelatedTopics &&
                    data.RelatedTopics.length
                ) {

                    response += "📚 Related results:\n";

                    let count = 0;

                    for (
                        const topic
                        of data.RelatedTopics
                    ) {

                        if (
                            !topic.Text ||
                            !topic.FirstURL
                        ) {
                            continue;
                        }

                        response +=
                            `\n${count + 1}. ${topic.Text}\n` +
                            `${topic.FirstURL}\n`;

                        count++;

                        if (count >= 5) {
                            break;
                        }
                    }

                }


                if (
                    !data.AbstractText &&
                    !data.RelatedTopics?.length
                ) {

                    return (
                        `🔎 No direct results found for "${query}".\n\n` +
                        "Try a more specific search."
                    );
                }


                return response;

            } catch (error) {

                console.error(
                    "❌ Web search error:",
                    error
                );

                return (
                    "❌ Isaac could not access the web search service."
                );
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Open URL
        |--------------------------------------------------------------------------
        */

        let url = args[0];


        if (
            !url.startsWith("http://") &&
            !url.startsWith("https://")
        ) {

            url = "https://" + url;
        }


        try {

            const result = await fetchUrl(url);


            if (result.redirect) {

                return (
                    `🔗 Website redirected to:\n${result.redirect}`
                );
            }


            if (
                !result.status ||
                result.status >= 400
            ) {

                return (
                    `❌ Website returned HTTP ${result.status || "unknown"}.`
                );
            }


            const text = cleanHtml(
                result.data
            );


            const preview =
                text.length > 3000
                    ? text.substring(0, 3000) + "..."
                    : text;


            return (
                `🌐 *Isaac Web*\n\n` +
                `URL: ${url}\n` +
                `Status: ${result.status}\n\n` +
                preview
            );

        } catch (error) {

            console.error(
                "❌ Website access error:",
                error
            );

            return (
                "❌ Isaac could not access that website."
            );
        }
    }
};
