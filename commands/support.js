const { db } = require("../database/db");
const { addLog } = require("../services/logger");


module.exports = {

    name: "support",


    async execute(args,user){


        const message = args.join(" ");



        if(!message){

            return `
🎫 ISAAC AI SUPPORT

Please describe your problem.

Example:
support I need help with premium
`;

        }



        await db.read();



        db.data.tickets ||= [];



        const ticketId =
        "T" +
        String(db.data.tickets.length + 1)
        .padStart(3,"0");




        db.data.tickets.push({

            id: ticketId,
            userId: user.id,
            name: user.name,
            message,
            status:"pending",
            date:new Date().toISOString()

        });



        await db.write();



        await addLog(
            `🎫 New ticket ${ticketId}`
        );



        return `
🎫 ISAAC AI SUPPORT

Ticket:
${ticketId}

User:
${user.name}

Message:
${message}

Status:
⏳ Pending

👑 The owner will review your request.
`;

    }

};
