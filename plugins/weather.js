const https = require("https");

function fetchWeather(city) {

    return new Promise((resolve, reject) => {

        const encodedCity = encodeURIComponent(city);

        const url =
            `https://wttr.in/${encodedCity}?format=j1`;

        https.get(
            url,
            {
                headers: {
                    "User-Agent": "Isaac-George-AI/1.0"
                }
            },
            (response) => {

                let data = "";

                response.on("data", (chunk) => {
                    data += chunk;
                });

                response.on("end", () => {

                    if (response.statusCode !== 200) {
                        reject(
                            new Error(
                                `Weather service returned ${response.statusCode}`
                            )
                        );

                        return;
                    }

                    try {

                        resolve(
                            JSON.parse(data)
                        );

                    } catch (error) {

                        reject(error);

                    }

                });

            }
        ).on("error", reject);

    });
}


module.exports = {

    name: "weather",

    description: "Get current weather information",

    async execute(args, account) {

        if (!args.length) {

            return (
                "🌤️ *Isaac Weather*\n\n" +
                "Usage:\n" +
                "weather <city>\n\n" +
                "Examples:\n" +
                "weather Freetown\n" +
                "weather London"
            );

        }


        const city = args.join(" ");


        try {

            const data = await fetchWeather(city);

            const current =
                data.current_condition?.[0];

            const area =
                data.nearest_area?.[0];


            if (!current) {

                return (
                    `❌ Weather information for "${city}" ` +
                    "could not be found."
                );

            }


            const location =
                area?.areaName?.[0]?.value ||
                city;

            const country =
                area?.country?.[0]?.value ||
                "";


            const temperature =
                current.temp_C;

            const feelsLike =
                current.FeelsLikeC;

            const description =
                current.weatherDesc?.[0]?.value ||
                "Unknown";


            const humidity =
                current.humidity;

            const wind =
                current.windspeedKmph;

            const visibility =
                current.visibility;


            return (
                `🌤️ *Isaac Weather*\n\n` +

                `📍 Location: ${location}` +
                `${country ? `, ${country}` : ""}\n\n` +

                `🌡️ Temperature: ${temperature}°C\n` +

                `🤗 Feels like: ${feelsLike}°C\n` +

                `☁️ Condition: ${description}\n` +

                `💧 Humidity: ${humidity}%\n` +

                `💨 Wind: ${wind} km/h\n` +

                `👁️ Visibility: ${visibility} km`
            );

        } catch (error) {

            console.error(
                "❌ Weather error:",
                error.message
            );

            return (
                `❌ I couldn't get weather information ` +
                `for "${city}".`
            );

        }

    }

};
