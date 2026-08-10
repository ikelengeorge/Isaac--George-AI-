const https = require("https");
const http = require("http");


function checkSecurity(url) {

    return new Promise((resolve, reject) => {

        if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
        }

        let target;

        try {
            target = new URL(url);
        } catch (error) {
            reject(new Error("Invalid website URL"));
            return;
        }

        const client =
            target.protocol === "https:"
                ? https
                : http;


        const start = Date.now();


        const request = client.request(
            target,
            {
                method: "GET",

                timeout: 15000,

                headers: {
                    "User-Agent":
                        "Isaac-George-AI-Security-Scanner/1.0"
                }
            },

            response => {

                const headers =
                    response.headers || {};


                const checks = {

                    https: target.protocol === "https:",

                    hsts:
                        !!headers["strict-transport-security"],

                    contentSecurityPolicy:
                        !!headers["content-security-policy"],

                    frameOptions:
                        !!headers["x-frame-options"],

                    contentTypeOptions:
                        !!headers["x-content-type-options"],

                    referrerPolicy:
                        !!headers["referrer-policy"],

                    permissionsPolicy:
                        !!headers["permissions-policy"],

                    crossOriginOpenerPolicy:
                        !!headers["cross-origin-opener-policy"]

                };


                resolve({

                    success: true,

                    url: target.href,

                    status: response.statusCode,

                    responseTime:
                        Date.now() - start,

                    server:
                        headers.server || "Unknown",

                    checks

                });

                response.resume();

            }
        );


        request.on(
            "timeout",
            () => {

                request.destroy(
                    new Error("Request timed out")
                );

            }
        );


        request.on(
            "error",
            reject
        );


        request.end();

    });

}


module.exports = {

    name: "security",

    description:
        "Check website security headers and HTTPS configuration.",


    async execute(args) {

        if (
            !args ||
            args.length === 0
        ) {

            return (
                "🛡️ *Isaac Security Checker*\n\n" +

                "Usage:\n" +
                "security <website>\n\n" +

                "Examples:\n" +
                "security example.com\n" +
                "security https://google.com"
            );

        }


        const target =
            args.join(" ").trim();


        try {

            const result =
                await checkSecurity(target);


            if (!result.success) {
                return result;
            }


            const c =
                result.checks;


            return {

                success: true,

                url: result.url,

                status: result.status,

                responseTime:
                    result.responseTime,

                server: result.server,

                security: {

                    https:
                        c.https
                            ? "✅ Enabled"
                            : "❌ Not enabled",

                    hsts:
                        c.hsts
                            ? "✅ Present"
                            : "⚠️ Missing",

                    contentSecurityPolicy:
                        c.contentSecurityPolicy
                            ? "✅ Present"
                            : "⚠️ Missing",

                    frameOptions:
                        c.frameOptions
                            ? "✅ Present"
                            : "⚠️ Missing",

                    contentTypeOptions:
                        c.contentTypeOptions
                            ? "✅ Present"
                            : "⚠️ Missing",

                    referrerPolicy:
                        c.referrerPolicy
                            ? "✅ Present"
                            : "⚠️ Missing",

                    permissionsPolicy:
                        c.permissionsPolicy
                            ? "✅ Present"
                            : "⚠️ Missing",

                    crossOriginOpenerPolicy:
                        c.crossOriginOpenerPolicy
                            ? "✅ Present"
                            : "⚠️ Missing"

                }

            };


        } catch (error) {

            console.error(
                "❌ Security checker error:",
                error.message
            );


            return {

                success: false,

                message:
                    `Security check failed: ${error.message}`

            };

        }

    }

};
