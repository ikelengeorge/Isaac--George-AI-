const axios = require("axios");


async function sendRequest(url, data){

    try {

        const response = await axios.post(
            url,
            data
        );


        return response.data;


    } catch(error){

        return {
            error: true,
            message: error.message
        };

    }

}


module.exports = {
    sendRequest
};
