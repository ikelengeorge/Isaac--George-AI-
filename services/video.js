const { API_CONFIG } = require("./api");
const { sendRequest } = require("./apiClient");


async function generateVideo(prompt){

    if(!API_CONFIG.VIDEO_API_URL){

        return `
🎥 Isaac George AI Video Generator

Request:
"${prompt}"

Video API is not connected yet 🔑
Please add VIDEO_API_URL and VIDEO_API_KEY
`;

    }


    return await sendRequest(
        API_CONFIG.VIDEO_API_URL,
        {
            prompt: prompt,
            key: API_CONFIG.VIDEO_API_KEY
        }
    );

}


module.exports = {
    generateVideo
};
