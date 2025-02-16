const readline = require('readline');

async function chat(prompt) {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tinyllama", prompt: prompt })
    });
    const data = await response.json();
    console.log(data.response);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your prompt: ', (prompt) => {
    chat(prompt);
    rl.close();
});
