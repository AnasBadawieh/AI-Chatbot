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
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef(null);
  const sendButtonRef = useRef(null);
  const intervalRef = useRef(null);
  const chatEndRef = useRef(null);

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

  useEffect(() => {
    // Scroll to the bottom of the chat container whenever messages change
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);
    setIsGenerating(true);

    let botResponse = '';
    await chat(input, (partialResponse) => {
      botResponse = partialResponse;
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.sender === 'bot') {
          // Update the last bot message with the new partial response
          return [
            ...prevMessages.slice(0, -1),
            { text: botResponse, sender: 'bot' }
          ];
        } else {
          // Add a new bot message
          return [
            ...prevMessages,
            { text: botResponse, sender: 'bot' }
          ];
        }
      });
    });

    setLoading(false);
    setIsGenerating(false);

    if (ttsEnabled) {
      responsiveVoice.speak(botResponse, selectedVoice);
    }
  };

  const revealMessage = (message) => {
    let index = 0;
    setCurrentMessage('');

    intervalRef.current = setInterval(() => {
      setCurrentMessage((prev) => prev + message[index]);
      index++;

      if (index === message.length) {
        clearInterval(intervalRef.current);
        const botMessage = { text: message, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setCurrentMessage('');
        setIsGenerating(false);
      }
    }, 50); // Adjust the speed as needed (3ms per letter might be too fast)
  };

  const handleTtsToggle = () => {
    setTtsEnabled(!ttsEnabled);
    if (ttsEnabled) {
      responsiveVoice.cancel();
    }
  };

  const handleCancel = () => {
    clearInterval(intervalRef.current);
    setLoading(false);
    setIsGenerating(false);
    setCurrentMessage('');
    responsiveVoice.cancel();
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
              onChange={handleTtsToggle}
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
        <div ref={chatEndRef} />
      </div>
      {loading && (
        <div className="message bot">
          <div className="loading-spinner"></div>
        </div>
      )}
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
        <button
          ref={sendButtonRef}
          onClick={isGenerating ? handleCancel : handleSendMessage}
          disabled={loading}
        >
          {isGenerating ? 'Stop' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;