const http = require("http");
const https = require("https");
const dns = require("dns").promises;
const tls = require("tls");
const { URL } = require("url");

const SCANNER_VERSION = "5.0";

/*
|---------------------------------------------------->
| URL NORMALIZER
|---------------------------------------------------->
*/

function normalizeUrl(input) {
    if (!input) {
        throw new Error("Website URL is required.");
    }

    let value = String(input).trim();

    if (!/^https?:\/\//i.test(value)) {
        value = "https://" + value;
    }

    let parsed;

    try {
        parsed = new URL(value);
    } catch {
        throw new Error("Invalid website URL.");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Only HTTP and HTTPS websites are supported.");
    }

    return parsed.toString();
}

/*
|---------------------------------------------------->
| WEBSITE REQUEST
|---------------------------------------------------->
*/

function requestWebsite(target) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(target);

        const client =
            parsed.protocol === "https:"
                ? https
                : http;

        const start = Date.now();

        const request = client.request(
            {
                hostname: parsed.hostname,
                port: parsed.port || undefined,
                path:
                    parsed.pathname +
                    parsed.search,
                method: "GET",

                headers: {
                    "User-Agent":
                        "Isaac-George-AI-Website-Scanner/4.0",
                    "Accept":
                        "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8"
                },

                timeout: 15000
            },

            response => {
                let body = "";

                response.setEncoding("utf8");

                response.on("data", chunk => {
                    body += chunk;

                    /*
                    | Limit memory usage for very large pages.
                    */
                    if (body.length > 5000000) {
                        request.destroy(
                            new Error(
                                "Website response is too large."
                            )
                        );
                    }
                });

                response.on("end", () => {
                    resolve({
                        status:
                            response.statusCode || 0,

                        statusMessage:
                            response.statusMessage ||
                            "",

                        headers:
                            response.headers || {},

                        body,

                        finalUrl:
                            target,

                        responseTime:
                            Date.now() - start,

                        responseSize:
                            Buffer.byteLength(
                                body,
                                "utf8"
                            ),

                        redirects: 0
                    });
                });
            }
        );

        request.on("timeout", () => {
            request.destroy(
                new Error(
                    "Website request timed out."
                )
            );
        });

        request.on("error", reject);

        request.end();
    });
}

/*
|---------------------------------------------------->
| DNS
|---------------------------------------------------->
*/

async function getDNS(hostname) {
    const result = {
        A: [],
        AAAA: [],
        MX: [],
        NS: [],
        TXT: []
    };

    try {
        result.A =
            await dns.resolve4(hostname);
    } catch {}

    try {
        result.AAAA =
            await dns.resolve6(hostname);
    } catch {}

    try {
        const mx =
            await dns.resolveMx(hostname);

        result.MX =
            mx.map(record => ({
                exchange:
                    record.exchange || "",
                priority:
                    record.priority || 0,
                type: "MX"
            }));
    } catch {}

    try {
        result.NS =
            await dns.resolveNs(hostname);
    } catch {}

    try {
        result.TXT =
            await dns.resolveTxt(hostname);
    } catch {}

    return result;
}

/*
|---------------------------------------------------->
| SSL / TLS
|---------------------------------------------------->
*/

function getSSLInfo(hostname) {
    return new Promise(resolve => {
        let finished = false;

        const finish = result => {
            if (finished) return;

            finished = true;
            resolve(result);
        };

        const socket = tls.connect({
            host: hostname,
            port: 443,
            servername: hostname,
            rejectUnauthorized: false
        });

        socket.once("secureConnect", () => {
            try {
                const certificate =
                    socket.getPeerCertificate();

                const protocol =
                    socket.getProtocol();

                const cipher =
                    socket.getCipher();

                let daysRemaining = null;
                let certificateStatus =
                    "⚠️ Unknown";

                if (certificate.valid_to) {
                    const expiry =
                        new Date(
                            certificate.valid_to
                        );

                    daysRemaining =
                        Math.ceil(
                            (
                                expiry.getTime() -
                                Date.now()
                            ) /
                            86400000
                        );

                    if (daysRemaining < 0) {
                        certificateStatus =
                            "❌ Expired";
                    } else if (
                        daysRemaining <= 7
                    ) {
                        certificateStatus =
                            "🔴 Expires Soon";
                    } else if (
                        daysRemaining <= 30
                    ) {
                        certificateStatus =
                            "⚠️ Expiring Soon";
                    } else {
                        certificateStatus =
                            "✅ Valid";
                    }
                }

                finish({
                    enabled: true,

                    authorized:
                        socket.authorized,

                    protocol:
                        protocol || "Unknown",

                    cipher:
                        cipher
                            ? cipher.name
                            : "Unknown",

                    issuer:
                        certificate.issuer
                            ? (
                                certificate.issuer.O ||
                                certificate.issuer.CN ||
                                "Unknown"
                            )
                            : "Unknown",

                    subject:
                        certificate.subject
                            ? (
                                certificate.subject.CN ||
                                hostname
                            )
                            : hostname,

                    validFrom:
                        certificate.valid_from ||
                        null,

                    validTo:
                        certificate.valid_to ||
                        null,

                    daysRemaining,

                    certificateStatus
                });

                socket.end();
            } catch (error) {
                socket.end();

                finish({
                    enabled: false,
                    message: error.message
                });
            }
        });

        socket.setTimeout(8000, () => {
            socket.destroy();

            finish({
                enabled: false,
                message:
                    "SSL connection timed out."
            });
        });

        socket.once("error", error => {
            finish({
                enabled: false,
                message: error.message
            });
        });
    });
}

/*
|---------------------------------------------------->
| META INFORMATION
|---------------------------------------------------->
*/

function extractTitle(html) {
    const match =
        String(html || "").match(
            /<title[^>]*>([\s\S]*?)<\/title>/i
        );

    return match
        ? match[1]
            .replace(/\s+/g, " ")
            .trim()
        : "Unknown";
}

function extractMeta(html, name) {
    const source =
        String(html || "");

    const patterns = [
        new RegExp(
            `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`,
            "i"
        ),

        new RegExp(
            `<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`,
            "i"
        )
    ];

    for (const regex of patterns) {
        const match =
            source.match(regex);

        if (match) {
            return match[1].trim();
        }
    }

    return null;
}

function extractOpenGraph(html) {
    const result = {};

    const source =
        String(html || "");

    const patterns = [
        /<meta[^>]+property=["'](og:[^"']+)["'][^>]+content=["']([^"']*)["']/gi,
        /<meta[^>]+content=["']([^"']*)["'][^>]+property=["'](og:[^"']+)["']/gi
    ];

    for (const regex of patterns) {
        let match;

        while (
            (match = regex.exec(source))
        ) {
            if (
                match[1] &&
                match[1].startsWith("og:")
            ) {
                result[match[1]] =
                    match[2];
            } else {
                result[match[2]] =
                    match[1];
            }
        }
    }

    return result;
}

/*
|---------------------------------------------------->
| PAGE STATISTICS
|---------------------------------------------------->
*/

function countMatches(html, regex) {
    const matches =
        String(html || "").match(regex);

    return matches
        ? matches.length
        : 0;
}

function getPageStats(html) {
    const source =
        String(html || "");

    return {
        links:
            countMatches(
                source,
                /<a\b[^>]*href=/gi
            ),

        images:
            countMatches(
                source,
                /<img\b/gi
            ),

        scripts:
            countMatches(
                source,
                /<script\b/gi
            ),

        stylesheets:
            countMatches(
                source,
                /<link\b[^>]+stylesheet/gi
            ),

        forms:
            countMatches(
                source,
                /<form\b/gi
            ),

        headings:
            countMatches(
                source,
                /<h[1-6]\b/gi
            )
    };
}

/*
|---------------------------------------------------->
| TECHNOLOGY DETECTION
|---------------------------------------------------->
*/

function detectTechnologies(html, headers) {
    const source = String(html || "").toLowerCase();

    const headerText = Object.entries(headers || {})
        .map(([key, value]) => key + ": " + value)
        .join("\n")
        .toLowerCase();

    const all = source + "\n" + headerText;

    const tech = {
        cms: [],
        frontend: [],
        backend: [],
        ecommerce: [],
        analytics: [],
        libraries: [],
        server: []
    };

    function add(category, name) {
        if (!tech[category].includes(name)) {
            tech[category].push(name);
        }
    }

    // CMS
    if (all.includes("wp-content") || all.includes("wp-includes") || all.includes("wordpress")) {
        add("cms", "WordPress");
    }

    if (all.includes("joomla") || all.includes("/media/jui/")) {
        add("cms", "Joomla");
    }

    if (all.includes("drupal-settings-json") || all.includes("drupal.js")) {
        add("cms", "Drupal");
    }

    // Frontend
    if (all.includes("__next_data__") || all.includes("_next/static") || all.includes("next.js")) {
        add("frontend", "Next.js");
    }

    if (all.includes("__nuxt__") || all.includes("_nuxt/")) {
        add("frontend", "Nuxt");
    }

    if (all.includes("react") || all.includes("reactdom")) {
        add("frontend", "React");
    }

    if (all.includes("vue.js") || all.includes("vue.min.js") || all.includes("vue@")) {
        add("frontend", "Vue.js");
    }

    if (all.includes("angular") || all.includes("ng-version")) {
        add("frontend", "Angular");
    }

    // Backend
    if (all.includes("laravel") || all.includes("laravel_session")) {
        add("backend", "Laravel");
    }

    if (all.includes("phpsessid") || all.includes(".php")) {
        add("backend", "PHP");
    }

    if (all.includes("asp.net") || all.includes("x-aspnet-version")) {
        add("backend", "ASP.NET");
    }

    if (all.includes("express") || all.includes("x-powered-by: express")) {
        add("backend", "Express");
    }

    if (all.includes("node.js") || all.includes("nodejs")) {
        add("backend", "Node.js");
    }

    // E-commerce
    if (all.includes("shopify") || all.includes("cdn.shopify.com")) {
        add("ecommerce", "Shopify");
    }

    if (all.includes("woocommerce") || all.includes("wc-ajax")) {
        add("ecommerce", "WooCommerce");
    }

    if (all.includes("magento") || all.includes("mage/")) {
        add("ecommerce", "Magento");
    }

    // Analytics
    if (all.includes("google-analytics") || all.includes("googletagmanager.com") || all.includes("gtag(")) {
        add("analytics", "Google Analytics");
    }

    if (all.includes("googletagmanager")) {
        add("analytics", "Google Tag Manager");
    }

    if (all.includes("hotjar")) {
        add("analytics", "Hotjar");
    }

    if (all.includes("matomo")) {
        add("analytics", "Matomo");
    }

    // Libraries
    if (all.includes("jquery") || all.includes("jquery.min.js")) {
        add("libraries", "jQuery");
    }

    if (all.includes("bootstrap")) {
        add("libraries", "Bootstrap");
    }

    if (all.includes("tailwind")) {
        add("libraries", "Tailwind CSS");
    }

    if (all.includes("font-awesome") || all.includes("fontawesome")) {
        add("libraries", "Font Awesome");
    }

    // Server / CDN
    const server = String(headers["server"] || "").toLowerCase();

    if (server.includes("cloudflare") || all.includes("cloudflare")) {
        add("server", "Cloudflare");
    }

    if (server.includes("nginx")) {
        add("server", "Nginx");
    }

    if (server.includes("apache")) {
        add("server", "Apache");
    }

    if (String(headers["x-powered-by"] || "").toLowerCase().includes("express")) {
        add("backend", "Express");
    }

    return tech;
}

function analyzeSecurity(headers, protocol) {
    const security = {
        https: protocol === "https:" ? "✅ Enabled" : "❌ Disabled",

        hsts: headers["strict-transport-security"]
            ? "✅ Present" : "⚠️ Missing",

        contentSecurityPolicy: headers["content-security-policy"]
            ? "✅ Present" : "⚠️ Missing",

        frameOptions: headers["x-frame-options"]
            ? "✅ Present" : "⚠️ Missing",

        contentTypeOptions: headers["x-content-type-options"]
            ? "✅ Present" : "⚠️ Missing",

        referrerPolicy: headers["referrer-policy"]
            ? "✅ Present" : "⚠️ Missing",

        permissionsPolicy: headers["permissions-policy"]
            ? "✅ Present" : "⚠️ Missing",

        crossOriginOpenerPolicy: headers["cross-origin-opener-policy"]
            ? "✅ Present" : "⚠️ Missing",

        crossOriginResourcePolicy: headers["cross-origin-resource-policy"]
            ? "✅ Present" : "⚠️ Missing",

        crossOriginEmbedderPolicy: headers["cross-origin-embedder-policy"]
            ? "✅ Present" : "⚠️ Missing"
    };

    let score = 0;

    if (protocol === "https:") score += 20;
    if (headers["strict-transport-security"]) score += 15;
    if (headers["content-security-policy"]) score += 20;
    if (headers["x-frame-options"]) score += 10;
    if (headers["x-content-type-options"]) score += 10;
    if (headers["referrer-policy"]) score += 10;
    if (headers["permissions-policy"]) score += 10;
    if (headers["cross-origin-opener-policy"]) score += 5;
    if (headers["cross-origin-resource-policy"]) score += 5;
    if (headers["cross-origin-embedder-policy"]) score += 5;

    security.score = Math.min(score, 100);

security.grade =
    score >= 90 ? "A" :
    score >= 80 ? "B" :
    score >= 70 ? "C" :
    score >= 60 ? "D" :
    "F";

    security.rating =
        score >= 85 ? "Excellent" :
        score >= 70 ? "Good" :
        score >= 50 ? "Moderate" :
        "Needs Improvement";

    security.recommendations = [];

    if (!headers["strict-transport-security"])
        security.recommendations.push("Enable HSTS");

    if (!headers["content-security-policy"])
        security.recommendations.push("Add Content-Security-Policy");

    if (!headers["x-frame-options"])
        security.recommendations.push("Add X-Frame-Options");

    if (!headers["x-content-type-options"])
        security.recommendations.push("Add X-Content-Type-Options");

    if (!headers["referrer-policy"])
        security.recommendations.push("Add Referrer-Policy");

    if (!headers["permissions-policy"])
        security.recommendations.push("Add Permissions-Policy");

    if (!headers["cross-origin-opener-policy"])
        security.recommendations.push("Add Cross-Origin-Opener-Policy");

    if (!headers["cross-origin-resource-policy"])
        security.recommendations.push("Add Cross-Origin-Resource-Policy");

    if (!headers["cross-origin-embedder-policy"])
        security.recommendations.push("Add Cross-Origin-Embedder-Policy");

    return security;
}

async function scanWebsite(input) {
    let target;

    try {
        target =
            normalizeUrl(input);
    } catch (error) {
        return {
            success: false,
            url: input,
            message: error.message
        };
    }

    try {
        const response =
            await requestWebsite(
                target
            );

        const parsed =
            new URL(
                response.finalUrl
            );

        const hostname =
            parsed.hostname;

        const dnsInfo =
            await getDNS(
                hostname
            );

        const sslInfo =
            parsed.protocol === "https:"
                ? await getSSLInfo(
                    hostname
                )
                : {
                    enabled: false,
                    authorized: false,
                    protocol: "Not applicable",
                    daysRemaining: null,
                    certificateStatus:
                        "⚠️ Not using HTTPS"
                };

        const security =
            analyzeSecurity(
                response.headers,
                parsed.protocol
            );

        const page =
            getPageStats(
                response.body
            );

        const technologies =
            detectTechnologies(
                response.body,
                response.headers
            );

        const openGraph =
            extractOpenGraph(
                response.body
            );

        const contentType =
            response.headers[
                "content-type"
            ] || "Unknown";

        const server =
            response.headers.server ||
            "Unknown";

        const poweredBy =
            response.headers[
                "x-powered-by"
            ] ||
            "Unknown";

        const language =
            extractMeta(
                response.body,
                "language"
            ) ||
            (
                response.body.match(
                    /<html[^>]+lang=["']([^"']+)["']/i
                ) || []
            )[1] ||
            null;

        return {
            success: true,

            scannerVersion:
                SCANNER_VERSION,

            url:
                response.finalUrl,

            hostname,

            protocol:
                parsed.protocol.replace(
                    ":",
                    ""
                ),

            status:
                response.status,

            statusMessage:
                response.statusMessage,

            responseTime:
                response.responseTime,

            responseSize:
                response.responseSize,

            responseSizeKB:
                Number(
                    (
                        response.responseSize /
                        1024
                    ).toFixed(2)
                ),

            redirects:
                response.redirects || 0,

            title:
                extractTitle(
                    response.body
                ),

            description:
                extractMeta(
                    response.body,
                    "description"
                ),

            keywords:
                extractMeta(
                    response.body,
                    "keywords"
                ),

            language,

            server,

            poweredBy,

            contentType,

            technologies,

            openGraph,

            page,

            dns:
                dnsInfo,

            ssl:
                sslInfo,

            security
        };
    } catch (error) {
        return {
            success: false,

            url:
                target,

            message:
                `Website scan failed: ${error.message}`
        };
    }
}

/*
|---------------------------------------------------->
| COMMAND
|---------------------------------------------------->
*/

async function execute(args) {
    if (
        !args ||
        args.length === 0
    ) {
        return (
            "🔎 *Isaac Website Intelligence Scanner*\n\n" +

            "Usage:\n" +
            "scanner <website>\n\n" +

            "Examples:\n" +
            "scanner example.com\n" +
            "scanner wordpress.org\n\n" +

            "The scanner checks:\n" +
            "🌐 Website status\n" +
            "📡 DNS\n" +
            "🔒 SSL/TLS\n" +
            "🛡️ Security headers\n" +
            "📄 Metadata\n" +
            "🔗 Page structure\n" +
            "🧠 Technologies\n" +
            "↪️ Redirects"
        );
    }

    const target =
        args.join(" ");

    const result =
        await scanWebsite(
            target
        );

    return JSON.stringify(
        result,
        null,
        2
    );
}

/*
|---------------------------------------------------->
| EXPORT
|---------------------------------------------------->
*/

module.exports = {
    name: "scanner",

    description:
        "Advanced website intelligence, DNS, SSL, security and technology scanner.",

    enabled: true,

    execute,

    scanWebsite
};
