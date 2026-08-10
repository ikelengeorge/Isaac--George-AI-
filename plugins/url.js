const https = require("https");
const http = require("http");

function checkUrl(target) {

    return new Promise((resolve, reject) => {

        let url;

        try {

            url = new URL(target);

        } catch (error) {

            reject(
                new Error("Invalid URL")
            );

            return;
        }


        const client =
            url.protocol === "https:"
                ? https
                : http;


        const start =
            Date.now();


        const request =
            client.get(
                url,
                {
                    headers: {
                        "User-Agent":
                            "Isaac-George-AI/1.0"
                    }
                },
                (response) => {

                    const elapsed =
                        Date.now() - start;


                    response.resume();


                    response.on(
                        "end",
                        () => {

                            resolve({

                                status:
                                    response.statusCode,

                                statusMessage:
                                    response.statusMessage,

                                time:
                                    elapsed,

                                type:
                                    response.headers[
                                        "content-type"
                                    ] || "Unknown",

                                server:
                                    response.headers[
                                        "server"
                                    ] || "Unknown",

                                finalUrl:
                                    response.headers[
                                        "location"
                                    ] || target

                            });

                        }
                    );

                }
            );


        request.setTimeout(
            10000,
            () => {

                request.destroy();

                reject(
                    new Error(
                        "Request timed out"
                    )
                );

            }
        );


        request.on(
            "error",
            reject
        );

    });
}


module.exports = {

    name: "url",

    description: "Check websites and inspect URL information",

    async execute(args, account) {

        if (args.length < 2) {

            return (
                "🔗 *Isaac URL Tools*\n\n" +

                "Usage:\n" +
                "url check <website>\n\n" +

                "Examples:\n" +
                "url check https://example.com\n" +
                "url check https://google.com"
            );

        }


        const action =
            args[0].toLowerCase();


        const target =
            args.slice(1).join(" ");


        if (
            action !== "check" &&
            action !== "info"
        ) {

            return (
                "❌ Unknown URL action.\n\n" +
                "Use:\n" +
                "url check <website>"
            );

        }


        try {

            const result =
                await checkUrl(target);


            const online =
                result.status >= 200 &&
                result.status < 400;


            return (
                `🔗 *Isaac URL Tools*\n\n` +

                `🌐 URL:\n${target}\n\n` +

                `${online
                    ? "🟢 Status: Online"
                    : "🔴 Status: HTTP " + result.status}\n` +

                `📡 HTTP Status: ${result.status} ` +
                `(${result.statusMessage || "Unknown"})\n` +

                `⚡ Response Time: ${result.time} ms\n` +

                `📄 Content Type: ${result.type}\n` +

                `🖥️ Server: ${result.server}`
            );


        } catch (error) {

            console.error(
                "❌ URL error:",
                error.message
            );

            return (
                `🔴 Website check failed.\n\n` +
                `🌐 ${target}\n` +
                `❌ ${error.message}`
            );

        }

    }
};
