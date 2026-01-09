import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import './ScentFinder.css';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

const ScentFinder = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'system',
      content: "Hello, I am Josie, your personal Scent Sommelier. Tell me about the mood you're in, the occasion, or your favorite notes, and I shall curate the perfect fragrance for you.",
      type: 'text'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]); // Added loading to ensure it scrolls when typing indicator appears

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for the API (only role and content)
      const history = messages.map(msg => ({ role: msg.role, content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }));

      const response = await axios.post(`${API_URL}/api/josie`, {
        userMessage: userMessage.content,
        history: history
      });

      const aiData = response.data;

      // Determine message content based on type
      let aiContent = aiData.data;

      const aiMessage = {
        role: 'assistant',
        content: aiContent,
        type: aiData.type || 'text'
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error talking to Josie:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: { message: "I apologize, but I am momentarily overwhelmed by the scents of the world. Please try again." },
        type: 'text'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.type === 'text') {
      return <p>{typeof msg.content === 'string' ? msg.content : msg.content.message}</p>;
    }

    if (msg.type === 'recommendation') {
      const { message, product } = msg.content;
      return (
        <div className="recommendation-content">
          <p className="josie-text">{message}</p>
          {product && (
            <Link to={`/product/${product.id}`} className="recommendation-card-link">
              <div className="recommendation-card">
                <div className="rec-card-header">
                  <h4>{product.name}</h4>
                  <span className="rec-tag">Josie's Pick</span>
                </div>
                <p className="rec-reason">"{product.reason}"</p>
                <div className="rec-cta">View Bottle</div>
              </div>
            </Link>
          )}
        </div>
      );
    }

    if (msg.type === 'comparison') {
      const { message, products } = msg.content;
      return (
        <div className="comparison-content">
          <p className="josie-text">{message}</p>
          <div className="comparison-grid">
            {products.map((prod, idx) => (
              <Link to={`/product/${prod.id}`} key={idx} className="comparison-card-link">
                <div className="comparison-card">
                  <h5>{prod.name}</h5>
                  <p className="comparison-trait">{prod.trait}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return <p>...</p>;
  };

  return (
    <div className="container finder-page">
      <div className="chat-interface glass-card">
        <div className="chat-header">
          <div className="josie-avatar">
            <FaRobot />
          </div>
          <div className="header-info">
            <h2>Ask Josie</h2>
            <span className="status-indicator">Online • AI Sommelier</span>
          </div>
        </div>

        <div className="chat-window" ref={chatWindowRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role === 'user' ? 'user-row' : 'josie-row'}`}>
              {msg.role !== 'user' && (
                <div className="message-avatar josie">
                  <FaRobot />
                </div>
              )}

              <div className={`message-bubble ${msg.role} ${msg.type}`}>
                {renderMessageContent(msg)}
              </div>

              {msg.role === 'user' && (
                <div className="message-avatar user">
                  <FaUser />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message-row josie-row">
              <div className="message-avatar josie">
                <FaRobot />
              </div>
              <div className="message-bubble assistant typing">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a mood, memory, or scent..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScentFinder;