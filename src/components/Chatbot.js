import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import { chat } from '../api/chatbotAPI';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('UK English Male');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const sendButtonRef = useRef(null);

  useEffect(() => {
    // Highlight the text box when the website launches
    inputRef.current.focus();

    // Add event listener for Enter key
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        sendButtonRef.current.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    let botResponse = '';
    await chat(input, (partialResponse) => {
      botResponse = partialResponse;
      setMessages((prevMessages) => {
        // Remove the last bot message if it exists
        const filteredMessages = prevMessages.filter((msg) => msg.sender !== 'bot');
        return [
          ...filteredMessages,
          { text: botResponse, sender: 'bot' }
        ];
      });
    });

    setLoading(false);

    if (ttsEnabled) {
      responsiveVoice.speak(botResponse, selectedVoice);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        AI Chatbot
        <div className="tts-controls">
          <label>
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={() => setTtsEnabled(!ttsEnabled)}
            />
            Text-to-Speech
          </label>
          {ttsEnabled && (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              <option value="UK English Male">UK English Male</option>
              <option value="UK English Female">UK English Female</option>
              <option value="US English Male">US English Male</option>
              <option value="US English Female">US English Female</option>
              {/* Add more voice options as needed */}
            </select>
          )}
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <Message key={index} text={msg.text} sender={msg.sender} />
        ))}
        {loading && (
          <div className="message bot">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          ref={inputRef}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={loading}
        />
        <button ref={sendButtonRef} onClick={handleSendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;