const { API_CONFIG } = require("./api");
const { sendRequest } = require("./apiClient");


async function editPhoto(instruction){

    if(!API_CONFIG.IMAGE_API_URL){

        return `
🖼️ Isaac George AI Photo Editor

Request:
"${instruction}"

Photo editing API is not connected yet 🔑
Please add IMAGE_API_URL and IMAGE_API_KEY
`;

    }


    return await sendRequest(
        API_CONFIG.IMAGE_API_URL,
        {
            instruction: instruction,
            key: API_CONFIG.IMAGE_API_KEY
        }
    );

}


module.exports = {
    editPhoto
};
