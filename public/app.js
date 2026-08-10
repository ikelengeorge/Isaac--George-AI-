async function checkStatus() {
    const status = document.getElementById("status");

    try {
        const response = await fetch("/health");
        const data = await response.json();

        status.textContent =
            data.success ? "🟢 Online" : "🔴 Offline";

    } catch (error) {
        status.textContent = "🔴 Offline";
    }
}


async function loadPlugins() {
    const container = document.getElementById("plugins");

    try {
        const response = await fetch("/api/plugins");
        const data = await response.json();

        if (!data.success) {
            container.textContent = "Unable to load plugins.";
            return;
        }

        container.innerHTML = "";

        data.plugins.forEach(plugin => {
            const div = document.createElement("div");

            div.className = "plugin";

            div.innerHTML = `
                <strong>
                    ${plugin.enabled ? "🟢" : "🔴"}
                    ${plugin.name}
                </strong>
                <small>${plugin.description}</small>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        container.textContent =
            "Plugin API unavailable.";
    }
}


function addMessage(text, type) {
    const messages =
        document.getElementById("chatMessages");

    const div =
        document.createElement("div");

    div.className = `message ${type}`;
    div.textContent = text;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}


async function sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    addMessage("🤔 Thinking...", "assistant");

    const messages = document.getElementById("chatMessages");
    const thinking = messages.lastElementChild;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        if (data.success) {
            thinking.textContent = data.reply;
        } else {
            thinking.textContent =
                "❌ " + (data.error || "AI request failed.");
        }

    } catch (error) {
        console.error("Chat error:", error);
        thinking.textContent =
            "❌ Unable to connect to Isaac George AI.";
    }
}

async function scanWebsite() {
    const input =
        document.getElementById("scanInput");

    const result =
        document.getElementById("scanResult");

    const target =
        input.value.trim();

    if (!target) {
        result.textContent =
            "Please enter a website.";

        return;
    }

    result.textContent =
        "🔍 Scanner API will be connected next...";
}


checkStatus();
loadPlugins();
