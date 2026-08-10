const { askAI } = require("../services/ai");
const { saveMemory, getMemory } = require("../services/memory");
const { addXP } = require("../services/xp");


module.exports = {

    name: "ai",


    async execute(args,user){


        const message = args.join(" ");


        if(!message){

            return "Please enter a message";

        }


        const memories = await getMemory(user.id);


        let context = "";


        if(memories.length){

            context =
`
Previous conversations:

${memories
.slice(-5)
.map(m => "User: " + m.message)
.join("\n")}
`;

        }



        const reply = await askAI(
            context + "\nUser: " + message
        );



        await saveMemory(
            user.id,
            message,
            reply
        );


        await addXP(
            user.id,
            10
        );


        return reply;

    }

};
