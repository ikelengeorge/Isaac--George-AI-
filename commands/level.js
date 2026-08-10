const { getUserLevel } = require("../services/xp");


module.exports = {

    name: "level",


    async execute(args,user){


        const profile = await getUserLevel(user.id);


        if(!profile){

            return "❌ User not found";

        }


        return `
🏆 ISAAC AI LEVEL

👤 Name: ${profile.name}
⭐ Level: ${profile.level || 1}
⚡ XP: ${profile.xp || 0}

Keep using Isaac AI 🚀
`;

    }

};
