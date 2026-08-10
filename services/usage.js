const { db } = require("../database/db");


async function checkLimit(userId){

    await db.read();


    const user = db.data.users.find(
        u => u.id === userId
    );


    if(!user){
        return {
            allowed:false,
            message:"User not found"
        };
    }


    if(user.role === "admin"){
        return {
            allowed:true,
            message:"Unlimited access"
        };
    }


    if(user.usage >= user.dailyLimit){

        return {
            allowed:false,
            message:"Daily limit reached"
        };

    }


    user.usage += 1;

    await db.write();


    return {
        allowed:true,
        remaining:user.dailyLimit - user.usage
    };

}


module.exports = {
    checkLimit
};
