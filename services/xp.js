const { db } = require("../database/db");


async function addXP(userId, amount = 10){

    await db.read();


    const user = db.data.users.find(
        u => u.id === userId
    );


    if(!user){
        return null;
    }


    user.xp ||= 0;
    user.level ||= 1;


    user.xp += amount;


    const neededXP = user.level * 100;


    if(user.xp >= neededXP){

        user.level += 1;
        user.xp = 0;

    }


    await db.write();


    return user;

}



async function getUserLevel(userId){

    await db.read();


    return db.data.users.find(
        u => u.id === userId
    );

}



async function leaderboard(){

    await db.read();


    return db.data.users
    .sort((a,b) => (b.level || 1) - (a.level || 1))
    .map(
        (u,index)=>
`${index + 1}. ${u.name} - Level ${u.level || 1} (${u.xp || 0} XP)`
    )
    .join("\n");

}



module.exports = {
    addXP,
    getUserLevel,
    leaderboard
};
