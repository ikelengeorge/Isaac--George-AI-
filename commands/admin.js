const { isSuperAdmin } = require("../database/users");
const { db } = require("../database/db");
const { addLog } = require("../services/logger");
const fs = require("fs");


module.exports = {

name: "admin",


async execute(args,user){


if(!isSuperAdmin(user)){

return "❌ Access denied. Admin only.";

}



await db.read();


db.data.requests ||= [];
db.data.tickets ||= [];
db.data.announcements ||= [];



const action = args[0];




// STATS
if(action === "stats"){


const total = db.data.users.length;

const premium = db.data.users.filter(
u => u.premium
).length;


const banned = db.data.users.filter(
u => u.banned
).length;


return `
👑 ISAAC AI ADMIN PANEL

👥 Users: ${total}
💎 Premium: ${premium}
🚫 Banned: ${banned}
🚀 Status: Online
`;

}




// USERS
if(action === "users"){


return db.data.users.map(
u =>
`${u.id} - ${u.name} (${u.role})`
).join("\n");


}





// PREMIUM REQUESTS
if(action === "requests"){


const requests = db.data.requests.filter(
r => r.status === "pending"
);


if(requests.length === 0){

return "💎 No pending requests";

}


return `
💎 PREMIUM REQUESTS

${requests.map(
r =>
`${r.userId} - ${r.name}
Status: ${r.status}
Date: ${r.date}`
).join("\n\n")}
`;

}





// APPROVE PREMIUM
if(action === "approve"){


const id = args[1];


const userAccount = db.data.users.find(
u => u.id === id
);


if(!userAccount){

return "❌ User not found";

}


userAccount.premium = true;
userAccount.dailyLimit = 999999;


await db.write();


return `✅ ${userAccount.name} is now Premium`;

}





// ANNOUNCE
if(action === "announce"){


const message = args.slice(1).join(" ");


if(!message){

return "❌ Enter announcement";

}


db.data.announcements.push({

message,
sender:"Isaac George",
date:new Date().toISOString()

});


await db.write();


return `
📢 ISAAC AI ANNOUNCEMENT

${message}

From:
👑 Isaac George
`;

}





// LEADERBOARD
if(action === "leaderboard"){


const list = db.data.users.sort(
(a,b)=>
(b.xp || 0)-(a.xp || 0)
);



return `
🏆 ISAAC AI LEADERBOARD

${list.map(
(u,i)=>
`${i+1}. ${u.name}
⭐ Level: ${u.level || 1}
⚡ XP: ${u.xp || 0}`
).join("\n\n")}

🚀 Keep using Isaac AI
`;

}





// BACKUP
if(action === "backup"){


fs.writeFileSync(
"database/backup.json",
JSON.stringify(db.data,null,2)
);


await addLog(
"💾 Database backup created"
);


return "💾 Backup created successfully";

}





// LOGS
if(action === "logs"){


if(!db.data.logs || db.data.logs.length === 0){

return "📜 No logs";

}


return db.data.logs.map(
l =>
`${l.time}
${l.message}`
).join("\n\n");

}





// SYSTEM
if(action === "system"){


return `
🤖 ISAAC AI SYSTEM

Database: ✅ Online
Owner: 👑 Isaac George
Role: Super Admin
Users: ${db.data.users.length}
Status: 🚀 Running
`;

}





// SUPPORT TICKETS
if(action === "tickets"){


if(db.data.tickets.length === 0){

return "🎫 No support tickets";

}



return `
🎫 SUPPORT TICKETS

${db.data.tickets.map(
t =>
`${t.id}
👤 ${t.name}
📌 Status: ${t.status}
💬 ${t.message}`
).join("\n\n")}
`;

}





// CLOSE TICKET
if(action === "close"){


const id = args[1];


const ticket = db.data.tickets.find(
t => t.id === id
);



if(!ticket){

return "❌ Ticket not found";

}



ticket.status = "closed";


await db.write();


await addLog(
`🎫 Ticket closed ${id}`
);



return `✅ Ticket ${id} closed`;

}





return `
👑 ADMIN COMMANDS

admin stats
admin users
admin requests
admin approve ID
admin announce MESSAGE
admin leaderboard
admin backup
admin logs
admin system
admin tickets
admin close ID
`;

}


};
