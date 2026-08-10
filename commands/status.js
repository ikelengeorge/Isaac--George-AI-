const { testConnection } = require("../services/apiTest");


module.exports = {

name: "status",


execute(args, user){

    const api = testConnection();


    return `
🤖 ISAAC GEORGE AI SYSTEM STATUS

🧠 AI Chat API:
${api.ai}

🎨 Image API:
${api.image}

🎥 Video API:
${api.video}


👤 Developer:
Isaac George

🚀 System: Online
`;

}

};
