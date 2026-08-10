const fs = require("fs");
const path = require("path");

const {
    checkUser,
    increaseUsage
} = require("../middleware/security");

const pluginManager = require("./plugins/pluginManager");

const commands = {};


function loadBuiltInCommands() {

    const folder = path.join(
        __dirname,
        "../commands"
    );

    if (!fs.existsSync(folder)) {
        return;
    }

    const files = fs.readdirSync(folder);

    for (const file of files) {

        if (!file.endsWith(".js")) {
            continue;
        }

        try {

            const item = require(
                path.join(folder, file)
            );

            if (item && item.name) {

                commands[item.name] = item;

                console.log(
                    `⚙️ Command loaded: ${item.name}`
                );

            }

        } catch (error) {

            console.error(
                `❌ Failed to load command ${file}:`,
                error.message
            );

        }
    }
}


/*
|--------------------------------------------------------------------------
| Load System
|--------------------------------------------------------------------------
*/

loadBuiltInCommands();

pluginManager.loadPlugins();


/*
|--------------------------------------------------------------------------
| Run Command
|--------------------------------------------------------------------------
*/

async function runCommand(name, args, user) {

    const security = await checkUser(user);

    if (!security.allowed) {
        return security.message;
    }


    /*
    |--------------------------------------------------------------------------
    | Find Built-in Command
    |--------------------------------------------------------------------------
    */

    let command = commands[name];


    /*
    |--------------------------------------------------------------------------
    | Check Plugin Command Dynamically
    |--------------------------------------------------------------------------
    */

    if (pluginManager.hasPlugin(name)) {

        if (!pluginManager.isEnabled(name)) {
            return `🔴 Plugin "${name}" is disabled.`;
        }

        command = pluginManager.getCommand(name);
    }


    /*
    |--------------------------------------------------------------------------
    | Command Not Found
    |--------------------------------------------------------------------------
    */

    if (!command) {
        return "Command not found ❌";
    }


    /*
    |--------------------------------------------------------------------------
    | Execute Command
    |--------------------------------------------------------------------------
    */

    try {

        const response = await command.execute(
            args,
            security.account
        );


        /*
        |--------------------------------------------------------------------------
        | Usage Tracking
        |--------------------------------------------------------------------------
        */

        if (
            security.account.role !== "superadmin" &&
            !security.account.premium
        ) {

            await increaseUsage(
                security.account.id
            );

        }


        return response;

    } catch (error) {

        console.error(
            `❌ Command error [${name}]:`,
            error
        );

        return "❌ An error occurred while executing this command.";
    }
}


module.exports = {
    runCommand,
    commands
};
