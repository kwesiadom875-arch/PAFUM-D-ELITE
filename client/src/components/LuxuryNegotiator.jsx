import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './LuxuryNegotiator.css';

const LuxuryNegotiator = ({ product, onDealAccepted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [offer, setOffer] = useState('');
  const [dealMade, setDealMade] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Greetings. I can authorize a discretionary rate for this ${product.name}. What is your proposal?` }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleOffer = async () => {
    if (!offer) return;
    const userPrice = parseFloat(offer);

    // 1. Add User Message
    const newHistory = [...messages, { sender: 'user', text: `I offer GH₵${userPrice}` }];
    setMessages(newHistory);
    setOffer('');
    setIsTyping(true);

    try {
      // 2. Call AI Backend
      // Prepare history for AI (map 'ai' -> 'assistant')
      const apiHistory = newHistory.map(m => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await axios.post(`${API_URL}/api/negotiate`, {
        product: { name: product.name, price: product.price },
        userOffer: userPrice,
        history: apiHistory
      });

      const { reply, status } = res.data;

      // 3. Update UI
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);

      if (status === 'accepted') {
        setDealMade(true);
        onDealAccepted(userPrice);
      }
    } catch (error) {
      console.error("Negotiation error:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "I seem to be having trouble consulting my ledger. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return (
    <button className="btn-outline negotiate-trigger" onClick={() => setIsOpen(true)}>
      Negotiate Price
    </button>
  );

  return (
    <div className="negotiator-card">
      {/* Header */}
      <div className="chat-header">
        <div className="header-info">
          <div className="status-dot"></div>
          <span>Private Concierge</span>
        </div>
        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.sender}`}>
            {m.text}
          </div>
        ))}
        {isTyping && (
          <div className="msg ai typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area or Deal Certificate */}
      {!dealMade ? (
        <div className="chat-input-area">
          <input
            type="number"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            placeholder="Enter your offer..."
            onKeyDown={(e) => e.key === 'Enter' && handleOffer()}
          />
          <button className="send-btn" onClick={handleOffer}>→</button>
        </div>
      ) : (
        <div className="deal-certificate">
          <h4>Deal Secured</h4>
          <p>The price has been updated.</p>
        </div>
      )}
    </div>
  );
};

export default LuxuryNegotiator;