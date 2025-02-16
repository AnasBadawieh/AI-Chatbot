const readline = require('readline');

async function chat(prompt) {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tinyllama", prompt: prompt })
    });

    // ✅ Read response as text
    const text = await response.text();

    // ✅ Split response into JSON objects (handle streaming)
    const jsonObjects = text.trim().split("\n").map(line => {
        try {
            return JSON.parse(line);
        } catch (error) {
            console.error("Error parsing JSON line:", line);
            return null;
        }
    });

    // ✅ Extract the actual response text
    const fullResponse = jsonObjects
        .filter(obj => obj && obj.response) // Remove null/invalid entries
        .map(obj => obj.response) // Get only the response text
        .join(""); // Join all chunks

    console.log("Bot:", fullResponse);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your prompt: ', (prompt) => {
    chat(prompt).then(() => rl.close());
});
