require("dotenv").config();


const API_CONFIG = {

    AI_API_KEY: process.env.AI_API_KEY || "",
    AI_API_URL: process.env.AI_API_URL || "",


    IMAGE_API_KEY: process.env.IMAGE_API_KEY || "",
    IMAGE_API_URL: process.env.IMAGE_API_URL || "",


    VIDEO_API_KEY: process.env.VIDEO_API_KEY || "",
    VIDEO_API_URL: process.env.VIDEO_API_URL || ""

};


module.exports = {
    API_CONFIG
};
