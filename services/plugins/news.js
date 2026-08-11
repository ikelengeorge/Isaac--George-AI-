const axios = require("axios");

async function execute(args = []) {
    try {
        const query = args.join(" ").trim() || "latest news";

        const response = await axios.get(
            "https://news.google.com/rss/search",
            {
                params: {
                    q: query,
                    hl: "en-US",
                    gl: "US",
                    ceid: "US:en"
                },
                timeout: 8000
            }
        );

        const xml = response.data;

        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
            .slice(0, 5)
            .map((match) => {
                const item = match[1];
                const title =
                    item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
                const link =
                    item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";

                return `• ${title.replace(/<!\[CDATA\[|\]\]>/g, "")}\n  ${link}`;
            });

        if (!items.length) {
            return "I couldn't find current news right now.";
        }

        return `📰 Latest News\n\n${items.join("\n\n")}`;

    } catch (error) {
        console.error("❌ News plugin error:", error.message);
        return "⚠️ I couldn't reach the news service right now.";
    }
}

module.exports = {
    name: "news",
    description: "Get current news",
    execute
};
