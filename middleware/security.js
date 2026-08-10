const { db } = require("../database/db");


function isNewDay(date){

    const today = new Date().toDateString();

    const saved = new Date(date).toDateString();


    return today !== saved;

}




async function checkUser(user){


    await db.read();


    const account = db.data.users.find(
        u => u.id === user.id
    );


    if(!account){

        return {
            allowed:false,
            message:"❌ User not registered"
        };

    }



    if(account.banned){

        return {
            allowed:false,
            message:`
🚫 ACCESS DENIED

Your account has been suspended.

Contact Owner:
👑 Isaac George
📲 +23232090565
`
        };

    }




    // Daily reset
    if(
        !account.lastReset ||
        isNewDay(account.lastReset)
    ){

        account.usage = 0;
        account.lastReset = new Date().toISOString();

        await db.write();

    }





    // Premium and admin bypass
    if(
        account.premium ||
        account.role === "superadmin"
    ){

        return {
            allowed:true,
            account
        };

    }





    if(account.usage >= account.dailyLimit){

        return {
            allowed:false,
            message:`
⚠️ DAILY LIMIT REACHED

You have used all your free requests today.

💎 Upgrade to Premium for more access.
`
        };

    }




    return {
        allowed:true,
        account
    };

}





async function increaseUsage(userId){


    await db.read();


    const account = db.data.users.find(
        u => u.id === userId
    );


    if(account){

        account.usage =
        (account.usage || 0) + 1;


        await db.write();

    }

}



module.exports = {
    checkUser,
    increaseUsage
};
