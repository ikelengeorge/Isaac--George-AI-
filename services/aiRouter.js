const pluginManager = require("./plugins/pluginManager");
const { askAI } = require("./ai");

// Make sure plugins are available to the router
pluginManager.loadPlugins();

async function routeAI(message) {
    const text = String(message || "").trim();

    if (!text) {
        return "Please enter a message.";
    }

    const lower = text.toLowerCase();

if (lower.includes("news")) {
    return "📰 Current news service is being connected.";
}

    /*
    |--------------------------------------------------------------------------
    | WEATHER
    |--------------------------------------------------------------------------
    */

    if (
        lower.startsWith("weather ") ||
        lower === "weather" ||
        lower.includes("what's the weather") ||
        lower.includes("what is the weather") ||
        lower.includes("weather in ")
    ) {
        const plugin = pluginManager.getCommand("weather");

        if (plugin) {
            let city = text
                .replace(/^weather\s*/i, "")
                .replace(/^what's the weather\s*(in)?\s*/i, "")
                .replace(/^what is the weather\s*(in)?\s*/i, "")
                .replace(/^.*weather in\s*/i, "")
                .trim();

            if (!city) {
                return await plugin.execute([]);
            }

            return await plugin.execute([city]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | WEBSITE SCANNER
    |--------------------------------------------------------------------------
    */

    if (
        lower.startsWith("scanner ") ||
        lower.startsWith("scan ") ||
        lower.includes("scan this website") ||
        lower.includes("scan the website") ||
        lower.includes("analyze this website")
    ) {
        const plugin = pluginManager.getCommand("scanner");

        if (plugin) {
            let target = text
                .replace(/^scanner\s*/i, "")
                .replace(/^scan\s*/i, "")
                .replace(/^scan this website\s*/i, "")
                .replace(/^scan the website\s*/i, "")
                .replace(/^analyze this website\s*/i, "")
                .trim();

            if (!target) {
                return await plugin.execute([]);
            }

            return await plugin.execute([target]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | NORMAL AI
    |--------------------------------------------------------------------------
    */

    return await askAI(text);
}

module.exports = {
    routeAI
};
