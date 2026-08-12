const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function saveMemory(userId, message, reply) {
    await sql`
        INSERT INTO conversation_memory
        (user_id, message, reply)
        VALUES (
            ${String(userId)},
            ${String(message)},
            ${String(reply)}
        )
    `;
}

async function getMemory(userId) {
    const rows = await sql`
        SELECT
            user_id,
            message,
            reply,
            created_at
        FROM conversation_memory
        WHERE user_id = ${String(userId)}
        ORDER BY created_at ASC
    `;

    return rows.map(row => ({
        userId: row.user_id,
        message: row.message,
        reply: row.reply,
        time: row.created_at
    }));
}

module.exports = {
    saveMemory,
    getMemory
};
