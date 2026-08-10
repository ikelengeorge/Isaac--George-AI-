const { API_CONFIG } = require("./api");


function testConnection(){

    return {

        ai:
        API_CONFIG.AI_API_KEY
        ? "Ready ✅"
        : "Missing Key 🔑",


        image:
        API_CONFIG.IMAGE_API_KEY
        ? "Ready ✅"
        : "Missing Key 🔑",


        video:
        API_CONFIG.VIDEO_API_KEY
        ? "Ready ✅"
        : "Missing Key 🔑"

    };

}


module.exports = {
    testConnection
};
