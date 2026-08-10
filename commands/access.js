const { accessMessage } = require("../services/access");

module.exports = {

    name: "access",

    aliases: [
        "premium",
        "upgrade",
        "admin"
    ],

    execute(args, user) {

        return accessMessage("premium or admin access");

    }

};
