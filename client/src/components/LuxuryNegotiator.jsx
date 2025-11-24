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

  // Only scroll when new messages are added, not when typing
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]); // Changed to track message count instead of full messages array

  // Auto-close modal when deal is made
  useEffect(() => {
    if (dealMade) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        setDealMade(false);
      }, 3000); // Close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [dealMade]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className="btn-outline negotiate-trigger" onClick={() => setIsOpen(true)}>
        Negotiate Price
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="negotiator-overlay" onClick={closeModal}>
          <div className="negotiator-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="chat-header">
              <div className="header-info">
                <div className="status-dot"></div>
                <span>Private Concierge</span>
              </div>
              <button className="close-btn" onClick={closeModal}>×</button>
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
                <div className="certificate-icon">✓</div>
                <h4>Deal Secured</h4>
                <p>The price has been updated.</p>
                <p className="closing-message">Closing in 3 seconds...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LuxuryNegotiator;