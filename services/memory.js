const { db } = require("../database/db");


async function saveMemory(userId, message, reply){

    await db.read();


    db.data.memory ||= [];


    db.data.memory.push({

        userId,
        message,
        reply,
        time: new Date().toISOString()

    });


    await db.write();

}



async function getMemory(userId){

    await db.read();


    if(!db.data.memory){
        return [];
    }


    return db.data.memory.filter(
        item => item.userId === userId
    );

}



module.exports = {
    saveMemory,
    getMemory
};
