const axios = require("axios");

module.exports = {
    name: "ip",
    description: "Look up public IP address information",

    async execute(args) {
        const target = args[0];

        if (!target) {
            return (
                "🌐 *Isaac IP Information*\n\n" +
                "Usage:\n" +
                "ip 8.8.8.8\n" +
                "ip me"
            );
        }

        try {
            let url;

            if (target.toLowerCase() === "me") {
                url = "https://ipwho.is/";
            } else {
                url = `https://ipwho.is/${encodeURIComponent(target)}`;
            }

            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    "User-Agent": "Isaac-George-AI/1.0"
                }
            });

            const data = response.data;

            if (!data.success) {
                return `❌ Could not find information for IP: ${target}`;
            }

            return (
                "🌐 *Isaac IP Information*\n\n" +
                `📡 IP: ${data.ip || "Unknown"}\n` +
                `🌍 Country: ${data.country || "Unknown"}\n` +
                `🏙️ City: ${data.city || "Unknown"}\n` +
                `🗺️ Region: ${data.region || "Unknown"}\n` +
                `🏢 ISP: ${data.connection?.isp || "Unknown"}\n` +
                `🕐 Timezone: ${data.timezone?.id || "Unknown"}\n` +
                `📍 Latitude: ${data.latitude ?? "Unknown"}\n` +
                `📍 Longitude: ${data.longitude ?? "Unknown"}`
            );

        } catch (error) {
            console.error("IP plugin error:", error.message);

            return (
                "❌ IP lookup service is temporarily unavailable.\n\n" +
                "Please try again later."
            );
        }
    }
};
