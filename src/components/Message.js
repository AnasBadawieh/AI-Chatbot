import React from 'react';
import './Message.css';

function Message({ text, sender }) {
  return (
    <div className={`message ${sender}`}>
      <p>{text}</p>
    </div>
  );
}

export default Message;