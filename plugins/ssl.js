const https = require("https");

module.exports = {
    name: "ssl",
    description: "Check HTTPS and SSL certificate information",

    async execute(args) {
        let domain = args[0];

        if (!domain) {
            return (
                "🔐 *Isaac SSL Checker*\n\n" +
                "Usage:\n" +
                "ssl google.com\n" +
                "ssl example.com"
            );
        }

        domain = domain
            .replace(/^https?:\/\//, "")
            .replace(/\/.*$/, "")
            .trim();

        return new Promise((resolve) => {

            const options = {
                hostname: domain,
                port: 443,
                method: "GET",
                rejectUnauthorized: false,
                timeout: 10000
            };

            const request = https.request(options, (response) => {

                const certificate =
                    response.socket.getPeerCertificate();

                let message =
                    "🔐 *Isaac SSL Checker*\n\n" +
                    `🌐 Domain: ${domain}\n\n`;

                if (!certificate || !certificate.subject) {
                    message +=
                        "❌ No SSL certificate information available.";
                    
                    response.resume();
                    resolve(message);
                    return;
                }

                const validFrom = certificate.valid_from || "Unknown";
                const validTo = certificate.valid_to || "Unknown";
                const issuer =
                    certificate.issuer?.O || 
                    certificate.issuer?.CN ||
                    "Unknown";

                const subject =
                    certificate.subject?.CN ||
                    "Unknown";

                message +=
                    "🟢 HTTPS: Available\n" +
                    `📜 Certificate: ${subject}\n` +
                    `🏢 Issuer: ${issuer}\n` +
                    `📅 Valid From: ${validFrom}\n` +
                    `📅 Valid Until: ${validTo}\n` +
                    `🔢 Serial: ${certificate.serialNumber || "Unknown"}\n` +
                    `🔐 Protocol: ${response.socket.getProtocol() || "Unknown"}`;

                response.resume();
                resolve(message);
            });

            request.on("timeout", () => {
                request.destroy();

                resolve(
                    `❌ SSL check timed out for ${domain}.`
                );
            });

            request.on("error", (error) => {

                resolve(
                    "🔴 *Isaac SSL Checker*\n\n" +
                    `🌐 Domain: ${domain}\n` +
                    "❌ HTTPS connection failed.\n\n" +
                    `Reason: ${error.message}`
                );
            });

            request.end();
        });
    }
};
