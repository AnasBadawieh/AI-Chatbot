import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import { chat } from '../api/chatbotAPI';
import './ChatStyle/Chatbot.css';
import './ChatStyle/ChatMessages.css';
import './ChatStyle/ChatInput.css';
import './ChatStyle/ChatHeader.css';
import './ChatStyle/ChatTTS.css';
import './ChatStyle/ChatContainer.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('UK English Male');
  const [loading, setLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('active');
  const inputRef = useRef(null);
  const sendButtonRef = useRef(null);
  const intervalRef = useRef(null);
  const chatEndRef = useRef(null);
  const abortControllerRef = useRef(null);

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
    setIsTyping(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let botResponse = '';

    try {
      await chat(input, (partialResponse) => {
        botResponse = partialResponse;
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage?.sender === 'bot') {
              return [
                  ...prevMessages.slice(0, -1),
                  { text: botResponse, sender: 'bot' }
              ];
          }
          return [...prevMessages, { text: botResponse, sender: 'bot' }];
        });
      }, controller.signal);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Chat Error: ", error);
      }
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setIsTyping(false);
      abortControllerRef.current = null;
      if (ttsEnabled && botResponse) {
        responsiveVoice.speak(botResponse, selectedVoice, { rate: 0.9 });
      }
      inputRef.current.focus();
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setIsGenerating(false);
    responsiveVoice.cancel();
  };

  return (
    <div className="chat">
      <div className={`chat-header ${connectionStatus}`}>
        <div className="header-content">
          <span className="chat-title">AI Chatbot</span>
          <div className="header-effects"></div>
        </div>
        <div className="tts-controls">
          <label
            className={`tts-switch ${ttsEnabled ? 'active' : ''}`}
            onClick={handleTtsToggle}
          >
            Voice
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
      {isTyping && (
        <div className="typing-indicator">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
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
        >
          {isGenerating ? (
            // Stop icon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a192f">
              <rect x="6" y="6" width="12" height="12"/>
            </svg>
          ) : (
            // Arrow icon
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a192f">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;