const { testConnection } = require("../services/apiTest");


module.exports = {

name: "api",


execute(args, user){

    if(user.role !== "admin"){
        return "❌ Admin only command";
    }


    const api = testConnection();


    return `
🔐 ISAAC GEORGE AI API PANEL

🧠 AI:
${api.ai}

🎨 Image:
${api.image}

🎥 Video:
${api.video}

`;

}

};
