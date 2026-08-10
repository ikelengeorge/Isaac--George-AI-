const https = require("https");

function getRates(base) {

    return new Promise((resolve, reject) => {

        const url =
            `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;

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

                    try {

                        const result =
                            JSON.parse(data);

                        resolve(result);

                    } catch (error) {

                        reject(error);

                    }

                });

            }
        ).on("error", reject);

    });
}


const currencies = {

    dollar: "USD",
    dollars: "USD",
    usd: "USD",

    leone: "SLE",
    leones: "SLE",
    sle: "SLE",

    euro: "EUR",
    euros: "EUR",
    eur: "EUR",

    pound: "GBP",
    pounds: "GBP",
    gbp: "GBP",

    naira: "NGN",
    ngn: "NGN",

    cedi: "GHS",
    cedis: "GHS",
    ghs: "GHS",

    dalasi: "GMD",
    gmd: "GMD",

    franc: "XOF",
    xof: "XOF",

    rand: "ZAR",
    zar: "ZAR",

    yen: "JPY",
    jpy: "JPY",

    yuan: "CNY",
    cny: "CNY",

    rupee: "INR",
    inr: "INR",

    dirham: "AED",
    aed: "AED"
};


function getCurrencyCode(input) {

    const value =
        input.toLowerCase();

    return currencies[value] ||
        value.toUpperCase();
}


module.exports = {

    name: "currency",

    description: "Convert between world currencies",

    async execute(args, account) {

        if (args.length < 3) {

            return (
                "💱 *Isaac Currency*\n\n" +

                "Usage:\n" +
                "currency <from> <to> <amount>\n\n" +

                "Examples:\n" +
                "currency USD SLE 10\n" +
                "currency USD EUR 100\n" +
                "currency GBP SLE 50\n\n" +

                "Currency names and ISO codes are supported."
            );
        }


        const from =
            getCurrencyCode(args[0]);

        const to =
            getCurrencyCode(args[1]);


        const amount =
            Number(args[2]);


        if (!Number.isFinite(amount)) {

            return (
                "❌ Please enter a valid amount."
            );
        }


        try {

            const data =
                await getRates(from);


            if (
                !data ||
                data.result !== "success" ||
                !data.rates
            ) {

                return (
                    "❌ Currency service is unavailable."
                );
            }


            const rate =
                data.rates[to];


            if (!rate) {

                return (
                    `❌ Currency "${to}" is not supported.`
                );
            }


            const result =
                amount * rate;


            return (
                `💱 *Isaac Currency*\n\n` +

                `💵 From: ${amount} ${from}\n` +

                `🎯 To: ${to}\n\n` +

                `📊 Exchange Rate:\n` +
                `1 ${from} = ${rate} ${to}\n\n` +

                `✅ Result:\n` +
                `${result.toFixed(2)} ${to}`
            );


        } catch (error) {

            console.error(
                "❌ Currency error:",
                error.message
            );

            return (
                "❌ Isaac could not retrieve the exchange rate."
            );
        }
    }
};
