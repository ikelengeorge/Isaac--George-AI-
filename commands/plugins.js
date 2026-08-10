const pluginManager = require("../services/plugins/pluginManager");

module.exports = {
    name: "plugins",

    description: "Manage Isaac AI plugins",

    async execute(args, account) {

        // Only superadmin can manage plugins
        if (!account || account.role !== "superadmin") {
            return "❌ Only the superadmin can manage plugins.";
        }

        const action = args[0]
            ? args[0].toLowerCase()
            : null;

        const pluginName = args[1]
            ? args[1].toLowerCase()
            : null;

        // plugins
        if (!action) {
            const status = pluginManager.getStatus();

            if (!status || status.length === 0) {
                return "🔌 No plugins installed.";
            }

            let message =
                "🔌 *Isaac AI Plugins*\n\n";

            for (const plugin of status) {
                message +=
                    `${plugin.enabled ? "🟢" : "🔴"} ` +
                    `${plugin.name}` +
                    `${plugin.description ? " — " + plugin.description : ""}\n`;
            }

            message +=
                "\n💡 Type *plugins help* for commands.";

            return message;
        }

        // plugins help
        if (action === "help") {
            return (
                "🔌 *Isaac AI Plugin Manager*\n\n" +

                "📋 *Basic*\n" +
                "plugins\n" +
                "→ Show installed plugins\n\n" +

                "📊 *Status*\n" +
                "plugins list\n" +
                "→ Show plugin status\n\n" +

                "ℹ️ *Information*\n" +
                "plugins info weather\n" +
                "→ Show plugin information\n\n" +

                "🟢 *Enable*\n" +
                "plugins enable calc\n" +
                "→ Enable a plugin\n\n" +

                "🔴 *Disable*\n" +
                "plugins disable calc\n" +
                "→ Disable a plugin\n\n" +

                "🔄 *Reload*\n" +
                "plugins reload\n" +
                "→ Reload all plugins\n\n" +

                "🔢 *Count*\n" +
                "plugins count\n" +
                "→ Show plugin statistics\n\n" +

                "🔎 *Search*\n" +
                "plugins search web\n" +
                "→ Search installed plugins"
            );
        }

        // plugins list
        if (action === "list") {
            const status = pluginManager.getStatus();

            if (!status || status.length === 0) {
                return "🔌 No plugins installed.";
            }

            const enabled =
                status.filter(plugin => plugin.enabled);

            const disabled =
                status.filter(plugin => !plugin.enabled);

            let message =
                "🔌 *Plugin List*\n\n";

            for (const plugin of status) {
                message +=
                    `${plugin.enabled ? "🟢 ENABLED" : "🔴 DISABLED"} ` +
                    `${plugin.name}\n`;
            }

            message +=
                "\n━━━━━━━━━━━━━━━━━━\n" +
                `📦 Total: ${status.length}\n` +
                `🟢 Enabled: ${enabled.length}\n` +
                `🔴 Disabled: ${disabled.length}`;

            return message;
        }

        // plugins count
        if (action === "count") {
            const status = pluginManager.getStatus();

            if (!status || status.length === 0) {
                return "🔌 No plugins installed.";
            }

            const enabled =
                status.filter(plugin => plugin.enabled).length;

            const disabled =
                status.filter(plugin => !plugin.enabled).length;

            return (
                "📊 *ISAAC PLUGIN STATISTICS*\n\n" +
                "━━━━━━━━━━━━━━━━━━\n" +
                `📦 Total Plugins: ${status.length}\n` +
                `🟢 Enabled: ${enabled}\n` +
                `🔴 Disabled: ${disabled}\n` +
                "━━━━━━━━━━━━━━━━━━"
            );
        }

        // plugins search
        if (action === "search") {

            if (!pluginName) {
                return (
                    "❌ Please specify a search term.\n\n" +
                    "Example:\n" +
                    "plugins search web"
                );
            }

            const status = pluginManager.getStatus();

            const results = status.filter(plugin =>
                plugin.name
                    .toLowerCase()
                    .includes(pluginName) ||
                (plugin.description || "")
                    .toLowerCase()
                    .includes(pluginName)
            );

            if (results.length === 0) {
                return (
                    `🔎 No plugins found for "${pluginName}".`
                );
            }

            let message =
                `🔎 *Plugin Search: ${pluginName}*\n\n`;

            for (const plugin of results) {
                message +=
                    `${plugin.enabled ? "🟢" : "🔴"} ` +
                    `${plugin.name}\n` +
                    `   ${plugin.description || "No description"}\n\n`;
            }

            return message.trim();
        }

        // Actions below require a plugin name
        if (
            action === "info" ||
            action === "enable" ||
            action === "disable"
        ) {
            if (!pluginName) {
                return (
                    `❌ Please specify a plugin name.\n\n` +
                    `Example:\n` +
                    `plugins ${action} weather`
                );
            }
        }

        // plugins info
        if (action === "info") {
            const plugin =
                pluginManager.getPlugin(pluginName);

            if (!plugin) {
                return (
                    `❌ Plugin "${pluginName}" was not found.`
                );
            }

            const enabled =
                pluginManager.isEnabled(pluginName);

            return (
                "🔌 *PLUGIN INFORMATION*\n\n" +
                "━━━━━━━━━━━━━━━━━━\n" +
                `📦 Name: ${plugin.name}\n` +
                `📝 Description: ${
                    plugin.description || "No description"
                }\n` +
                `📊 Status: ${
                    enabled
                        ? "🟢 Enabled"
                        : "🔴 Disabled"
                }\n` +
                "━━━━━━━━━━━━━━━━━━"
            );
        }

        // plugins enable
        if (action === "enable") {
            const success =
                pluginManager.enablePlugin(pluginName);

            if (!success) {
                return (
                    `❌ Plugin "${pluginName}" was not found.`
                );
            }

            return (
                `🟢 Plugin "${pluginName}" enabled successfully.`
            );
        }

        // plugins disable
        if (action === "disable") {
            const success =
                pluginManager.disablePlugin(pluginName);

            if (!success) {
                return (
                    `❌ Plugin "${pluginName}" was not found.`
                );
            }

            return (
                `🔴 Plugin "${pluginName}" disabled successfully.`
            );
        }

        // plugins reload
        if (action === "reload") {
            try {
                pluginManager.reloadPlugins();

                return (
                    "🔄 *Isaac Plugin Manager*\n\n" +
                    "✅ All plugins reloaded successfully."
                );
            } catch (error) {
                return (
                    "❌ Failed to reload plugins.\n\n" +
                    `Reason: ${error.message}`
                );
            }
        }

        // Unknown command
        return (
            "❌ Unknown plugin action.\n\n" +
            "Try:\n" +
            "plugins help"
        );
    }
};
