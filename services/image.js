const { API_CONFIG } = require("./api");
const { sendRequest } = require("./apiClient");


async function generateImage(prompt){

    if(!API_CONFIG.IMAGE_API_URL){

        return `
🎨 Isaac George AI Image Generator

Prompt:
"${prompt}"

Image API is not connected yet 🔑
Please add IMAGE_API_URL and IMAGE_API_KEY
`;

    }


    return await sendRequest(
        API_CONFIG.IMAGE_API_URL,
        {
            prompt: prompt,
            key: API_CONFIG.IMAGE_API_KEY
        }
    );

}


module.exports = {
    generateImage
};
