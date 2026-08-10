const readline = require("readline");

const { connectDB } = require("./database/db");
const { getUser, addUser } = require("./database/users");
const { runCommand } = require("./services/commandHandler");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


async function startBot() {

    try {

        // ==============================
        // CONNECT DATABASE
        // ==============================

        await connectDB();


        // ==============================
        // CREATE / UPDATE CURRENT USER
        // ==============================

        await addUser(
            "001",
            "Isaac George"
        );


        // ==============================
        // GET CURRENT USER
        // ==============================

        const user = await getUser("001");


        console.log("\n👑 Current User:");
        console.log(user);


        // ==============================
        // ISAAC AI STARTUP MESSAGE
        // ==============================

        console.log(`
🤖 Isaac George AI Online 🚀

Type commands. Example:
profile
ai hello
admin stats
help
`);


        // ==============================
        // COMMAND INPUT
        // ==============================

        function ask() {

            rl.question("> ", async (input) => {

                try {

                    // ------------------------------
                    // Clean input
                    // ------------------------------

                    input = input
                        .trim()
                        .replace(/^>+\s*/, "");


                    // ------------------------------
                    // Ignore empty input
                    // ------------------------------

                    if (!input) {
                        ask();
                        return;
                    }


                    // ------------------------------
                    // Split command and arguments
                    // ------------------------------

                    const parts = input.split(/\s+/);


                    // ------------------------------
                    // Get command
                    // ------------------------------

                    const command = parts
                        .shift()
                        .toLowerCase();


                    // ------------------------------
                    // Get arguments
                    // ------------------------------

                    const args = parts;


                    // ------------------------------
                    // Run command
                    // ------------------------------

                    const response = await runCommand(
                        command,
                        args,
                        user
                    );


                    // ==============================
                    // DISPLAY RESPONSE
                    // ==============================

                    if (
                        response !== null &&
                        typeof response === "object"
                    ) {

                        console.log(
                            "\n" +
                            JSON.stringify(
                                response,
                                null,
                                2
                            )
                        );

                    } else {

                        console.log(
                            "\n" +
                            String(response)
                        );

                    }


                } catch (error) {

                    console.error(
                        "\n❌ Input error:",
                        error
                    );

                }


                // ==============================
                // CONTINUE LISTENING
                // ==============================

                ask();

            });

        }


        // ==============================
        // START COMMAND INTERFACE
        // ==============================

        ask();


    } catch (error) {

        console.error(
            "❌ Isaac AI failed to start:",
            error
        );

        rl.close();

    }

}


startBot();
