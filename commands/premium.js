const { db } = require("../database/db");
const { addLog } = require("../services/logger");


module.exports = {

    name: "premium",


    async execute(args, user){


        await db.read();


        db.data.requests ||= [];


        const existing = db.data.requests.find(
            r => r.userId === user.id && r.status === "pending"
        );


        if(existing){

            return `
💎 PREMIUM REQUEST

You already have a pending request.

Please wait for owner approval.
`;

        }



        db.data.requests.push({

            userId: user.id,
            name: user.name,
            status: "pending",
            date: new Date().toISOString()

        });



        await db.write();



        await addLog(
            `💎 ${user.name} requested Premium access`
        );



        return `
💎 ISAAC AI PREMIUM REQUEST

Your request has been submitted successfully ✅

Status:
⏳ Pending Approval

👑 Owner:
Isaac George

📲 WhatsApp:
+23232090565

Please wait for approval.
`;

    }

};
