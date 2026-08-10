const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    if (!sock.authState?.creds?.registered) {
        const phoneNumber = "232XXXXXXXX"; // put your WhatsApp number here

        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("Pairing Code:", code);
        }, 3000);
    }

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            console.log("✅ WhatsApp connected");
        }

        if (connection === "close") {
            console.log("❌ Connection closed");
        }
    });
}

startBot();
