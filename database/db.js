const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");


const adapter = new JSONFile("./database/data.json");

const db = new Low(adapter, {
    users: [],
    logs: [],
    memory: [],
    requests: [],
    announcements: [],
    tickets: []
});



async function connectDB(){

    await db.read();


    db.data ||= {
        users: [],
        logs: [],
        memory: [],
        requests: [],
        announcements: [],
        tickets: []
    };


    db.data.tickets ||= [];


    await db.write();


    console.log("✅ Database Connected");

}


module.exports = {
    db,
    connectDB
};
