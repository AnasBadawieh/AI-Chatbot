import React, { useState } from 'react';
import Message from './Message';
import { chat } from '../api/chatbotAPI';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: 'user' };
      setMessages([...messages, userMessage]);
      setInput('');

      const botResponse = await chat(input);
      const botMessage = { text: botResponse, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);

      if (ttsEnabled) {
        responsiveVoice.speak(botResponse, "UK English Male");
      }
    }
  };

  return (
    <div>
      <div className="chat-header">
        AI Chatbot
        <label>
          <input
            type="checkbox"
            checked={ttsEnabled}
            onChange={() => setTtsEnabled(!ttsEnabled)}
          />
          Text-to-Speech
        </label>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} sender={msg.sender} />
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;