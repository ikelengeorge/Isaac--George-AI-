const { db } = require("../database/db");


module.exports = {

name: "users",


async execute(args, user){

    if(user.role !== "admin"){
        return "❌ Admin only command";
    }


    await db.read();


    if(db.data.users.length === 0){
        return "No users found";
    }


    let result = "👥 ISAAC GEORGE AI USERS\n\n";


    db.data.users.forEach((u, index)=>{

        result += `
${index + 1}. ${u.name}
ID: ${u.id}
Role: ${u.role}
Premium: ${u.premium ? "Yes 💎" : "No"}
Limit: ${u.dailyLimit}

`;

    });


    return result;

}

};
