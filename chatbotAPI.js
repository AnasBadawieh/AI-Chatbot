const readline = require('readline');

async function chat(prompt) {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tinyllama", prompt: prompt })
    });

    // ✅ Handle the response as a stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
    }

    try {
        const jsonData = JSON.parse(result);
        console.log("Bot:", jsonData.response);
    } catch (error) {
        console.error("Error parsing response:", error);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your prompt: ', (prompt) => {
    chat(prompt).then(() => rl.close());
});
