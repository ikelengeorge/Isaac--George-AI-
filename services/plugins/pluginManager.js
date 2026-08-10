const fs = require("fs");
const path = require("path");

class PluginManager {

    constructor(pluginFolder) {

        this.pluginFolder = pluginFolder;

        this.plugins = new Map();

        this.commands = new Map();

        this.disabled = new Set();

        // Persistent plugin state file
        this.stateFile = path.join(
            __dirname,
            "../../database/pluginState.json"
        );

        this.loadState();
    }


    /*
    |--------------------------------------------------------------------------
    | Load Persistent State
    |--------------------------------------------------------------------------
    */

    loadState() {

        try {

            if (!fs.existsSync(this.stateFile)) {

                this.saveState();

                return;
            }

            const data = fs.readFileSync(
                this.stateFile,
                "utf8"
            );

            const state = JSON.parse(data);

            if (Array.isArray(state.disabled)) {

                this.disabled = new Set(
                    state.disabled
                );

            }

        } catch (error) {

            console.error(
                "❌ Failed to load plugin state:",
                error.message
            );

            this.disabled = new Set();
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Save Persistent State
    |--------------------------------------------------------------------------
    */

    saveState() {

        try {

            const folder = path.dirname(
                this.stateFile
            );

            if (!fs.existsSync(folder)) {

                fs.mkdirSync(
                    folder,
                    { recursive: true }
                );

            }

            const state = {

                disabled: Array.from(
                    this.disabled
                )

            };

            fs.writeFileSync(
                this.stateFile,
                JSON.stringify(
                    state,
                    null,
                    4
                )
            );

        } catch (error) {

            console.error(
                "❌ Failed to save plugin state:",
                error.message
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Load Plugins
    |--------------------------------------------------------------------------
    */

    loadPlugins() {

        if (!fs.existsSync(this.pluginFolder)) {

            console.log(
                "⚠️ Plugin folder not found."
            );

            return;
        }

        const files = fs.readdirSync(
            this.pluginFolder
        );

        for (const file of files) {

            if (!/^[a-zA-Z0-9_-]+\.js$/.test(file)) {
            console.log(`⏭️ Skipping backup/version file: ${file}`);
            continue;
        }

            try {

                const filePath = path.join(
                    this.pluginFolder,
                    file
                );

                delete require.cache[
                    require.resolve(filePath)
                ];

                const plugin = require(
                    filePath
                );

                if (
                    !plugin ||
                    !plugin.name
                ) {

                    console.log(
                        `⚠️ Skipping invalid plugin: ${file}`
                    );

                    continue;
                }

                this.plugins.set(
                    plugin.name,
                    plugin
                );


                // Only enable if not disabled
                if (
                    !this.disabled.has(
                        plugin.name
                    )
                ) {

                    this.commands.set(
                        plugin.name,
                        plugin
                    );

                }


                console.log(
                    `🔌 Plugin loaded: ${plugin.name}`
                );

            } catch (error) {

                console.error(
                    `❌ Failed to load plugin ${file}:`,
                    error.message
                );

            }
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Get Plugin
    |--------------------------------------------------------------------------
    */

    getPlugin(name) {

        return this.plugins.get(name);
    }


    /*
    |--------------------------------------------------------------------------
    | Get Command
    |--------------------------------------------------------------------------
    */

    getCommand(name) {

        return this.commands.get(name);
    }


    /*
    |--------------------------------------------------------------------------
    | Get Enabled Commands
    |--------------------------------------------------------------------------
    */

    getCommands() {

        return Object.fromEntries(
            this.commands
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Get All Plugins
    |--------------------------------------------------------------------------
    */

    getPlugins() {

        return Object.fromEntries(
            this.plugins
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Check Plugin
    |--------------------------------------------------------------------------
    */

    hasPlugin(name) {

        return this.plugins.has(name);
    }


    /*
    |--------------------------------------------------------------------------
    | Enable Plugin
    |--------------------------------------------------------------------------
    */

    enablePlugin(name) {

        const plugin = this.plugins.get(
            name
        );

        if (!plugin) {
            return false;
        }

        this.disabled.delete(
            name
        );

        this.commands.set(
            name,
            plugin
        );

        this.saveState();

        return true;
    }


    /*
    |--------------------------------------------------------------------------
    | Disable Plugin
    |--------------------------------------------------------------------------
    */

    disablePlugin(name) {

        if (!this.plugins.has(name)) {
            return false;
        }

        this.disabled.add(
            name
        );

        this.commands.delete(
            name
        );

        this.saveState();

        return true;
    }


    /*
    |--------------------------------------------------------------------------
    | Check Enabled
    |--------------------------------------------------------------------------
    */

    isEnabled(name) {

        return (
            this.plugins.has(name) &&
            !this.disabled.has(name)
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Reload Plugins
    |--------------------------------------------------------------------------
    */

    reloadPlugins() {

        this.plugins.clear();

        this.commands.clear();

        // Disabled state remains because
        // it is stored separately

        this.loadPlugins();
    }


    /*
    |--------------------------------------------------------------------------
    | Plugin Status
    |--------------------------------------------------------------------------
    */

    getStatus() {

        const status = [];

        for (
            const [name, plugin]
            of this.plugins
        ) {

            status.push({

                name: name,

                description:
                    plugin.description || "",

                enabled:
                    !this.disabled.has(name)

            });

        }

        return status;
    }

}


const pluginManager = new PluginManager(
    path.join(
        __dirname,
        "../../plugins"
    )
);


module.exports = pluginManager;
