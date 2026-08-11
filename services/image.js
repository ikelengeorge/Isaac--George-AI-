const axios = require("axios");
require("dotenv").config();

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

async function generateImage(prompt) {
    const token = String(process.env.REPLICATE_API_TOKEN || "").trim();

    if (!token) {
        return "🎨 Isaac George AI\n\nReplicate API token is not configured.";
    }

    try {
        const createResponse = await axios.post(
            REPLICATE_API_URL,
            {
                version: "black-forest-labs/flux-schnell",
                input: {
                    prompt: String(prompt || "").trim()
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                timeout: 30000
            }
        );

        let prediction = createResponse.data;

        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed" &&
            prediction.status !== "canceled"
        ) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const statusResponse = await axios.get(
                `${REPLICATE_API_URL}/${prediction.id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    timeout: 30000
                }
            );

            prediction = statusResponse.data;
        }

        if (prediction.status !== "succeeded") {
            console.error("❌ Replicate prediction:", prediction);
            return "❌ Image generation failed.";
        }

        const output = prediction.output;

        if (Array.isArray(output)) {
            return output[0] || "❌ Replicate returned no image.";
        }

        return output || "❌ Replicate returned no image.";

    } catch (error) {
        console.error(
            "❌ Replicate image error:",
            error.response?.data || error.message
        );

        return "⚠️ Isaac could not generate the image right now.";
    }
}

module.exports = {
    generateImage
};
