const { db } = require("./db");


async function addUser(id, name){

    await db.read();

    let user = db.data.users.find(
        u => u.id === id
    );


    if(user){

        // Ensure new security fields exist
        if(user.banned === undefined){
            user.banned = false;
        }

        if(id === "001"){
            user.role = "superadmin";
            user.premium = true;
            user.dailyLimit = 999999;
        }

        await db.write();

        return "User updated";
    }


    db.data.users.push({

        id,
        name,

        role: id === "001"
            ? "superadmin"
            : "user",

        premium: id === "001",

        dailyLimit: id === "001"
            ? 999999
            : 20,

        usage: 0,

        banned: false,

        createdAt: new Date().toISOString()

    });


    await db.write();

    return "User created";

}



async function getUser(id){

    await db.read();

    return db.data.users.find(
        user => user.id === id
    );

}



function isSuperAdmin(user){

    return user && user.role === "superadmin";

}


module.exports = {
    addUser,
    getUser,
    isSuperAdmin
};
