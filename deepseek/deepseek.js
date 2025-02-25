const axios = require('axios');

const data = {
    model: "deepseek-ai/DeepSeek-V3",
    messages: [
        {
            role: "user",
            content: "What is the capital of France?"
        }
    ]
};

axios.post('http://localhost:8000/v1/chat/completions', data, {
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log(response.data);
})
.catch(error => {
    console.error('Error:', error);
});