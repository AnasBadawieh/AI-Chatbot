// src/api/chatbotAPI.js
export async function chat(prompt) {
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tinyllama", prompt: prompt })
    });

    const text = await response.text();
    const jsonObjects = text.trim().split("\n").map(line => {
        try {
            return JSON.parse(line);
        } catch (error) {
            console.error("Error parsing JSON line:", line);
            return null;
        }
    });

    const fullResponse = jsonObjects
        .filter(obj => obj && obj.response)
        .map(obj => obj.response)
        .join("");

    return fullResponse;
}
