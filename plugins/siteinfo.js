const http = require("http");
const https = require("https");
const { URL } = require("url");

/*
|--------------------------------------------------------------------------
| URL NORMALIZER
|--------------------------------------------------------------------------
*/

function normalizeUrl(input) {
    if (!input) {
        throw new Error("Website URL is required.");
    }

    let target = String(input).trim();

    // Convert Markdown links:
    // [https://example.com](https://example.com)
    const markdownMatch = target.match(
        /^\[([^\]]+)\]\(([^)]+)\)$/
    );

    if (markdownMatch) {
        target = markdownMatch[2];
    }

    // Remove surrounding brackets accidentally supplied
    target = target
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .trim();

    // Add HTTPS when protocol is missing
    if (!/^https?:\/\//i.test(target)) {
        target = "https://" + target;
    }

    const parsed = new URL(target);

    if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
    ) {
        throw new Error("Only HTTP and HTTPS websites are supported.");
    }

    return parsed.toString();
}


/*
|--------------------------------------------------------------------------
| HTTP REQUEST
|--------------------------------------------------------------------------
*/

function requestWebsite(target, redirects = 0) {

    return new Promise((resolve, reject) => {

        if (redirects > 5) {
            reject(
                new Error("Too many redirects.")
            );

            return;
        }

        let parsed;

        try {
            parsed = new URL(target);
        } catch (error) {
            reject(
                new Error("Invalid website URL.")
            );

            return;
        }

        const client =
            parsed.protocol === "https:"
                ? https
                : http;

        const startTime = Date.now();

        const request = client.request(
            {
                protocol: parsed.protocol,
                hostname: parsed.hostname,
                port: parsed.port || undefined,
                path:
                    parsed.pathname +
                    parsed.search,

                method: "GET",

                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (compatible; Isaac-George-AI/1.0)",

                    "Accept":
                        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

                    "Accept-Language":
                        "en-US,en;q=0.9",

                    "Connection":
                        "close"
                }
            },

            response => {

                let body = "";

                response.setEncoding("utf8");

                response.on(
                    "data",
                    chunk => {

                        // Prevent extremely large pages
                        if (body.length < 2000000) {
                            body += chunk;
                        }

                    }
                );

                response.on(
                    "end",
                    () => {

                        const responseTime =
                            Date.now() - startTime;

                        const location =
                            response.headers.location;

                        // Follow redirects
                        if (
                            location &&
                            response.statusCode >= 300 &&
                            response.statusCode < 400
                        ) {

                            try {

                                const nextUrl =
                                    new URL(
                                        location,
                                        target
                                    ).toString();

                                requestWebsite(
                                    nextUrl,
                                    redirects + 1
                                )
                                    .then(resolve)
                                    .catch(reject);

                                return;

                            } catch (error) {

                                reject(error);

                                return;
                            }
                        }

                        resolve({

                            status:
                                response.statusCode || 0,

                            statusMessage:
                                response.statusMessage || "",

                            headers:
                                response.headers || {},

                            body,

                            responseTime,

                            finalUrl:
                                target

                        });

                    }
                );

            }
        );


        request.setTimeout(
            15000,
            () => {

                request.destroy();

                reject(
                    new Error(
                        "Request timed out."
                    )
                );

            }
        );


        request.on(
            "error",
            error => {

                reject(error);

            }
        );


        request.end();

    });

}


/*
|--------------------------------------------------------------------------
| TECHNOLOGY DETECTION
|--------------------------------------------------------------------------
*/

function detectTechnologies(
    html,
    headers
) {

    const technologies = [];

    const add = (
        category,
        name
    ) => {

        if (
            !technologies.some(
                item =>
                    item.category === category &&
                    item.name === name
            )
        ) {

            technologies.push({
                category,
                name
            });

        }

    };


    const source =
        String(html || "");

    const lower =
        source.toLowerCase();

    const headerText =
        Object.keys(headers || {})
            .map(key =>
                `${key}: ${headers[key]}`
            )
            .join("\n")
            .toLowerCase();


    /*
    |--------------------------------------------------------------------------
    | CMS
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("wp-content") ||
        lower.includes("wp-includes") ||
        lower.includes("wordpress")
    ) {

        add(
            "CMS",
            "WordPress"
        );

    }


    if (
        lower.includes("drupal.settings") ||
        lower.includes("drupal.org") ||
        lower.includes("drupal")
    ) {

        add(
            "CMS",
            "Drupal"
        );

    }


    if (
        lower.includes("joomla") ||
        lower.includes("/media/jui/")
    ) {

        add(
            "CMS",
            "Joomla"
        );

    }


    if (
        lower.includes("ghost") &&
        (
            lower.includes("ghost.org") ||
            lower.includes("ghost-version")
        )
    ) {

        add(
            "CMS",
            "Ghost"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | E-COMMERCE
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("woocommerce") ||
        lower.includes("wc-")
    ) {

        add(
            "E-commerce",
            "WooCommerce"
        );

    }


    if (
        lower.includes("cdn.shopify.com") ||
        lower.includes("shopify")
    ) {

        add(
            "E-commerce",
            "Shopify"
        );

    }


    if (
        lower.includes("magento") ||
        lower.includes("mage/")
    ) {

        add(
            "E-commerce",
            "Magento"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | FRONTEND FRAMEWORKS
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("__next_data__") ||
        lower.includes("/_next/") ||
        lower.includes("next.js")
    ) {

        add(
            "Frontend",
            "Next.js"
        );

    }


    if (
        lower.includes("react") ||
        lower.includes("reactdom") ||
        lower.includes("react-dom")
    ) {

        add(
            "Frontend",
            "React"
        );

    }


    if (
        lower.includes("angular") ||
        lower.includes("ng-app") ||
        lower.includes("_ngcontent")
    ) {

        add(
            "Frontend",
            "Angular"
        );

    }


    if (
        lower.includes("vue.js") ||
        lower.includes("vuejs") ||
        lower.includes("__vue__")
    ) {

        add(
            "Frontend",
            "Vue.js"
        );

    }


    if (
        lower.includes("svelte")
    ) {

        add(
            "Frontend",
            "Svelte"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | JAVASCRIPT
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("jquery")
    ) {

        add(
            "JavaScript",
            "jQuery"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("font-awesome") ||
        lower.includes("fontawesome")
    ) {

        add(
            "UI",
            "Font Awesome"
        );

    }


    if (
        lower.includes("bootstrap")
    ) {

        add(
            "UI",
            "Bootstrap"
        );

    }


    if (
        lower.includes("tailwind")
    ) {

        add(
            "UI",
            "Tailwind CSS"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | ANALYTICS
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("google-analytics") ||
        lower.includes("googleanalytics") ||
        lower.includes("gtag(") ||
        lower.includes("googletagmanager")
    ) {

        add(
            "Analytics",
            "Google Analytics"
        );

    }


    if (
        lower.includes("matomo") ||
        lower.includes("_paq")
    ) {

        add(
            "Analytics",
            "Matomo"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | SERVER
    |--------------------------------------------------------------------------
    */

    const server =
        headers.server;

    if (server) {

        const serverName =
            String(server);

        if (
            /nginx/i.test(serverName)
        ) {

            add(
                "Server",
                "Nginx"
            );

        } else if (
            /apache/i.test(serverName)
        ) {

            add(
                "Server",
                "Apache"
            );

        } else if (
            /cloudflare/i.test(serverName)
        ) {

            add(
                "Server",
                "Cloudflare"
            );

        } else {

            add(
                "Server",
                serverName
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | SECURITY
    |--------------------------------------------------------------------------
    */

    if (
        headers["strict-transport-security"]
    ) {

        add(
            "Security",
            "HTTP Strict Transport Security"
        );

    }


    if (
        headers["content-security-policy"]
    ) {

        add(
            "Security",
            "Content Security Policy"
        );

    }


    if (
        headers["x-frame-options"]
    ) {

        add(
            "Security",
            "X-Frame-Options"
        );

    }


    if (
        headers["x-content-type-options"]
    ) {

        add(
            "Security",
            "X-Content-Type-Options"
        );

    }


    return technologies;

}


/*
|--------------------------------------------------------------------------
| SITE INFO
|--------------------------------------------------------------------------
*/

async function siteInfo(input) {

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
            await requestWebsite(target);


        const technologies =
            detectTechnologies(
                response.body,
                response.headers
            );


        /*
        |--------------------------------------------------------------------------
        | Fallback server detection
        |--------------------------------------------------------------------------
        */

        if (
            !technologies.some(
                item =>
                    item.category === "Server"
            )
        ) {

            const server =
                response.headers.server;

            if (server) {

                technologies.push({
                    category: "Server",
                    name: String(server)
                });

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Final result
        |--------------------------------------------------------------------------
        */

        return {

            success: true,

            url:
                response.finalUrl,

            status:
                response.status,

            title:
                extractTitle(
                    response.body
                ),

            responseTime:
                response.responseTime,

            technologies

        };

    } catch (error) {

        return {

            success: false,

            url: target,

            message:
                `Website inspection failed: ${error.message}`

        };

    }

}


/*
|--------------------------------------------------------------------------
| TITLE EXTRACTION
|--------------------------------------------------------------------------
*/

function extractTitle(html) {

    if (!html) {
        return "Unknown";
    }

    const match =
        html.match(
            /<title[^>]*>([\s\S]*?)<\/title>/i
        );

    if (!match) {
        return "Unknown";
    }

    return match[1]
        .replace(/\s+/g, " ")
        .trim();

}


/*
|--------------------------------------------------------------------------
| PLUGIN EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {

    name: "siteinfo",

    description:
        "Detect technologies used by a website.",

    enabled: true,

    execute: siteInfo,

    siteInfo

};
