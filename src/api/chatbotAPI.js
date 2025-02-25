export async function chat(prompt, onUpdate, signal) {
    let fullResponse = "";
    const therapistPrompt = `
        You are a therapist Q&A bot designed to provide thoughtful, empathetic, and supportive answers to emotional and personal questions. 
        You offer gentle guidance but do not provide medical or legal advice. 
        If asked about your identity or purpose, respond by saying: 
        "I am a therapist Q&A bot, here to listen and provide supportive guidance."
        
        User: ${prompt}
        Therapist:
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
