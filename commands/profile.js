const { db } = require("../database/db");


module.exports = {

name: "profile",


async execute(args,user){


await db.read();


const account = db.data.users.find(
u => u.id === user.id
);


if(!account){

return "❌ User not found";

}


return `
👤 ISAAC AI PROFILE

Name: ${account.name}
ID: ${account.id}

⭐ Level: ${account.level || 1}
⚡ XP: ${account.xp || 0}

📊 Usage:
${account.usage || 0} / ${account.dailyLimit || "Unlimited"}

💎 Premium: ${account.premium ? "YES" : "NO"}
👑 Role: ${account.role}

📅 Joined:
${account.createdAt}

🚀 Keep growing with Isaac AI
`;

}

};
