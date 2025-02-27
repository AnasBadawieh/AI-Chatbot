export async function chat(prompt, onUpdate, signal) {
    let fullResponse = "";
    const therapistPrompt = `
        "You are a testing chatbot designed to respond to users with very short answers (1 sentence or less) using basic vocabulary. 
        Prioritize brevity and simplicity. Avoid explanations, markdown, or complex terms. If a query is unclear, ask for clarification in 5 words or fewer.

        Examples:
        User: What's the weather?
        You: Sunny today.
        User: How old are you?
        You: No age.
        User: Explain gravity.
        You: Force pulling things down.

        Focus on speed and clarity. Only answer the question directly—no extra details."
        User: ${prompt}
    `;

    console.log("Prompt being sent:", therapistPrompt); // Debugging line

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "mistral", prompt: therapistPrompt, stream: true }),
            signal: signal
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const jsonChunks = chunk.split('\n').filter(Boolean);

                for (const jsonChunk of jsonChunks) {
                    const parsedChunk = JSON.parse(jsonChunk);
                    fullResponse += parsedChunk.response;
                    if (onUpdate) onUpdate(fullResponse);
                }
            }
        } finally {
            reader.releaseLock();
        }
    } catch (error) {
        if (error.name !== 'AbortError') throw error;
    }
    return fullResponse;
}
