const https = require("https");

function getTime(zone) {

    return new Promise((resolve, reject) => {

        const url =
            `https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(zone)}`;

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
                                `Time service returned ${response.statusCode}`
                            )
                        );

                        return;
                    }

                    try {

                        resolve(JSON.parse(data));

                    } catch (error) {

                        reject(error);

                    }

                });

            }
        ).on("error", reject);

    });
}


const zones = {

    freetown: "Africa/Freetown",
    london: "Europe/London",
    paris: "Europe/Paris",
    lagos: "Africa/Lagos",
    accra: "Africa/Accra",
    nairobi: "Africa/Nairobi",
    cairo: "Africa/Cairo",
    johannesburg: "Africa/Johannesburg",

    "new york": "America/New_York",
    chicago: "America/Chicago",
    denver: "America/Denver",
    "los angeles": "America/Los_Angeles",

    toronto: "America/Toronto",
    vancouver: "America/Vancouver",

    tokyo: "Asia/Tokyo",
    beijing: "Asia/Shanghai",
    singapore: "Asia/Singapore",
    dubai: "Asia/Dubai",
    mumbai: "Asia/Kolkata",

    sydney: "Australia/Sydney"
};


module.exports = {

    name: "time",

    description: "Get the current time around the world",

    async execute(args, account) {

        if (!args.length) {

            return (
                "🕐 *Isaac World Time*\n\n" +
                "Usage:\n" +
                "time <city>\n\n" +
                "Examples:\n" +
                "time Freetown\n" +
                "time London\n" +
                "time Tokyo"
            );
        }


        const city =
            args.join(" ").toLowerCase();

        const zone =
            zones[city] ||
            args.join("_");


        try {

            const data =
                await getTime(zone);


            if (!data) {

                return (
                    "❌ Could not retrieve the current time."
                );
            }


            const dateTime =
                data.dateTime || "Unknown";


            const date =
                data.date || "Unknown";


            const time =
                data.time || "Unknown";


            const day =
                data.dayOfWeek || "Unknown";


            const zoneName =
                data.timeZone || zone;


            return (
                `🕐 *Isaac World Time*\n\n` +

                `📍 Location: ${args.join(" ")}\n` +

                `🌍 Timezone: ${zoneName}\n\n` +

                `📅 Date: ${date}\n` +

                `🕐 Time: ${time}\n` +

                `📆 Day: ${day}`
            );


        } catch (error) {

            console.error(
                "❌ Time error:",
                error.message
            );

            return (
                `❌ I couldn't find the time for ` +
                `"${args.join(" ")}".`
            );
        }
    }
};
