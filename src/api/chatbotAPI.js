export async function chat(prompt, onUpdate, signal) {
    let fullResponse = "";
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "mistral", prompt: prompt, stream: true }),
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