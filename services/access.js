const owner = require("../config/owner");

function accessMessage(type = "feature") {

    return `
🔒 ACCESS REQUEST

The ${type} you requested requires owner approval.

👑 Owner:
${owner.ownerName}

📲 WhatsApp:
${owner.whatsapp}

Please contact the owner to request access.
`;
}

module.exports = {
    accessMessage
};
