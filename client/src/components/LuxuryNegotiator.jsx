import React, { useState, useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import API_URL from '../config';
import { retryRequest } from '../utils/errorHandler';
import { CartContext } from '../context/CartContext';
import './LuxuryNegotiator.css';

const LuxuryNegotiator = ({ product, onDealAccepted }) => {
  const { user } = useContext(CartContext);
  const [isOpen, setIsOpen] = useState(false);
  const [offer, setOffer] = useState('');
  const [dealMade, setDealMade] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Greetings. I can authorize a discretionary rate for this ${product.name}. What is your proposal?` }
  ]);
  const chatWindowRef = useRef(null);

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  // Only scroll when new messages are added or typing starts
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping]);

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

      await retryRequest(async () => {
        const res = await axios.post(`${API_URL}/api/negotiate`, {
          productId: product.id,
          offer: userPrice,
          history: apiHistory,
          userTier: user?.membershipTier || 'Standard'
        });

        const { message, status, counterOffer } = res.data;

        // 3. Update UI
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: message,
          isCounter: status === 'counter',
          counterPrice: counterOffer
        }]);

        if (status === 'accepted') {
          setDealMade(true);
          onDealAccepted(userPrice);
        }
      });
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

  const modalContent = (
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
        <div className="chat-window" ref={chatWindowRef}>
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
        </div>

        {/* Input Area or Deal Certificate */}
        {!dealMade ? (
          <div className="chat-input-area-wrapper">
            {/* Action Buttons for Counter Offer */}
            {messages[messages.length - 1]?.sender === 'ai' && messages[messages.length - 1]?.isCounter && !isTyping && offer === '' && (
              <div className="negotiation-actions" style={{ display: 'flex', gap: '10px', marginBottom: '10px', justifyContent: 'center' }}>
                <button
                  className="action-btn accept"
                  style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => {
                    setDealMade(true);
                    onDealAccepted(messages[messages.length - 1].counterPrice);
                  }}
                >
                  Accept GH₵{messages[messages.length - 1].counterPrice}
                </button>
                <button
                  className="action-btn reject"
                  style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={() => {
                    // Just focus input
                    document.querySelector('.chat-input-area input')?.focus();
                  }}
                >
                  Counter
                </button>
              </div>
            )}

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
  );

  return (
    <>
      <button className="btn-outline negotiate-trigger" onClick={() => setIsOpen(true)}>
        Negotiate Price
      </button>

      {/* Modal Overlay via Portal */}
      {isOpen && ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
};

LuxuryNegotiator.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired
  }).isRequired,
  onDealAccepted: PropTypes.func.isRequired
};

export default LuxuryNegotiator;