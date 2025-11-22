import React, { useState } from 'react';
import './LuxuryNegotiator.css';

const LuxuryNegotiator = ({ product, onDealAccepted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [offer, setOffer] = useState('');
  const [dealMade, setDealMade] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Greetings. I can authorize a discretionary rate for this ${product.name}. What is your proposal?` }
  ]);

  const handleOffer = () => {
    if (!offer) return;
    const userPrice = parseFloat(offer);
    const ratio = userPrice / product.price;
    let response = "";

    // Update Chat with User's Offer
    const newHistory = [...messages, { sender: 'user', text: `I offer GH₵${userPrice}` }];

    // --- THE AI LOGIC ---
    if (ratio < 0.5) {
      // Offer is less than 50%
      response = "I am afraid that is impossible. We are not a flea market. Please be reasonable.";
    } else if (ratio < 0.8) {
      // Offer is between 50% and 80% -> Counter Offer
      const counter = Math.floor((userPrice + (product.price * 0.85)) / 2);
      response = `That is too low. However, I can meet you at GH₵${counter}. Shall we agree?`;
    } else {
      // Offer is > 80% -> Accept
      response = "Excellent. I can accept that arrangement. The price has been updated.";
      setDealMade(true);
      onDealAccepted(userPrice); // Updates price in parent component
    }

    setMessages([...newHistory, { sender: 'ai', text: response }]);
    setOffer('');
  };

  if (!isOpen) return (
    <button className="btn-outline" style={{width: '100%', marginTop: '10px'}} onClick={() => setIsOpen(true)}>
      Negotiate Price
    </button>
  );

  return (
    <div className="negotiator-box glass-card">
      <div className="chat-header">
        <span>Concierge AI</span>
        <button onClick={() => setIsOpen(false)}>X</button>
      </div>
      
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.sender}`}>{m.text}</div>
        ))}
      </div>

      {!dealMade && (
        <div className="chat-input">
          <input 
            type="number" 
            value={offer} 
            onChange={(e) => setOffer(e.target.value)} 
            placeholder="Your Offer..." 
          />
          <button onClick={handleOffer}>Send</button>
        </div>
      )}
      {dealMade && <div className="success-msg">Deal Secured! Add to Cart.</div>}
    </div>
  );
};

export default LuxuryNegotiator;