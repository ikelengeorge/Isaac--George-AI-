const https = require("https");

function fetchNews(query = "") {

    return new Promise((resolve, reject) => {

        const search = query || "latest news";

        const url =
            `https://news.google.com/rss/search?q=${encodeURIComponent(search)}` +
            `&hl=en-US&gl=US&ceid=US:en`;

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
                                `News service returned ${response.statusCode}`
                            )
                        );

                        return;
                    }

                    resolve(data);
                });

            }
        ).on("error", reject);
    });
}


function decodeXml(text) {

    return text
        .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .trim();
}


function extractArticles(xml) {

    const articles = [];

    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    for (const item of items.slice(0, 5)) {

        const titleMatch =
            item.match(/<title>([\s\S]*?)<\/title>/i);

        const linkMatch =
            item.match(/<link>([\s\S]*?)<\/link>/i);

        const sourceMatch =
            item.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

        const dateMatch =
            item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);


        const title =
            titleMatch
                ? decodeXml(titleMatch[1])
                : "Untitled";


        const link =
            linkMatch
                ? decodeXml(linkMatch[1])
                : "";


        const source =
            sourceMatch
                ? decodeXml(sourceMatch[1])
                : "Unknown source";


        const date =
            dateMatch
                ? decodeXml(dateMatch[1])
                : "";


        articles.push({
            title,
            link,
            source,
            date
        });
    }

    return articles;
}


module.exports = {

    name: "news",

    description: "Get current news and headlines",

    async execute(args, account) {

        const query = args.join(" ").trim();

        try {

            const xml =
                await fetchNews(query);


            const articles =
                extractArticles(xml);


            if (!articles.length) {

                return (
                    `📰 No news results found for ` +
                    `"${query || "latest news"}".`
                );
            }


            let response =
                `📰 *Isaac News*\n\n`;


            if (query) {

                response +=
                    `🔎 Topic: ${query}\n\n`;

            } else {

                response +=
                    `🌍 Latest headlines\n\n`;
            }


            articles.forEach((article, index) => {

                response +=
                    `${index + 1}. ${article.title}\n` +
                    `📰 ${article.source}\n`;

                if (article.date) {

                    response +=
                        `🕒 ${article.date}\n`;
                }

                if (article.link) {

                    response +=
                        `🔗 ${article.link}\n`;
                }

                response += "\n";
            });


            return response.trim();

        } catch (error) {

            console.error(
                "❌ News error:",
                error.message
            );

            return (
                "❌ Isaac could not retrieve current news."
            );
        }
    }
};
