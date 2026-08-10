const { db } = require("../database/db");


async function addLog(message){

    await db.read();

    db.data.logs ||= [];


    db.data.logs.push({

        message: message,
        time: new Date().toISOString()

    });


    await db.write();

}


module.exports = {
    addLog
};
