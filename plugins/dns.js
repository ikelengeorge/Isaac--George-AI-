const dns = require("dns").promises;

module.exports = {
    name: "dns",
    description: "Look up DNS records for a domain",

    async execute(args) {
        const domain = args[0];

        if (!domain) {
            return (
                "🌐 *Isaac DNS Lookup*\n\n" +
                "Usage:\n" +
                "dns google.com\n" +
                "dns example.com"
            );
        }

        const cleanDomain = domain
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "")
            .trim();

        try {
            const result = await dns.lookup(cleanDomain, {
                all: true
            });

            let message =
                "🌐 *Isaac DNS Lookup*\n\n" +
                `🔎 Domain: ${cleanDomain}\n\n`;

            message += "📡 *IP Addresses*\n";

            for (const record of result) {
                message += `• ${record.address} (${record.family})\n`;
            }

            try {
                const mx = await dns.resolveMx(cleanDomain);

                message += "\n📧 *MX Records*\n";

                for (const record of mx) {
                    message +=
                        `• ${record.exchange} — Priority ${record.priority}\n`;
                }
            } catch {
                message += "\n📧 *MX Records*\n• None found\n";
            }

            try {
                const ns = await dns.resolveNs(cleanDomain);

                message += "\n🌍 *Name Servers*\n";

                for (const server of ns) {
                    message += `• ${server}\n`;
                }
            } catch {
                message += "\n🌍 *Name Servers*\n• None found\n";
            }

            try {
                const txt = await dns.resolveTxt(cleanDomain);

                message += "\n📝 *TXT Records*\n";

                for (const record of txt.slice(0, 5)) {
                    message += `• ${record.join("")}\n`;
                }
            } catch {
                message += "\n📝 *TXT Records*\n• None found\n";
            }

            return message;

        } catch (error) {
            console.error("DNS plugin error:", error.message);

            return (
                `❌ Unable to resolve "${cleanDomain}".\n\n` +
                "Make sure the domain name is correct."
            );
        }
    }
};
