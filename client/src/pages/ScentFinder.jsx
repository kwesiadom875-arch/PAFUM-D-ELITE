import React, { useState } from 'react';
import axios from 'axios';
import './ScentFinder.css';

const ScentFinder = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const askJosie = async () => {
    if (!input) return;
    setLoading(true);
    setResponse(null); // Clear previous answer

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/josie', { userMessage: input });
      setResponse(res.data.reply);
    } catch (err) {
      setResponse("I'm having trouble connecting to the ether right now.");
    }
    setLoading(false);
  };

  return (
    <div className="container finder-page">
      <div className="finder-window glass-card">
        
        <div className="text-center">
          <h2 style={{ color: '#C5A059', fontSize: '2.5rem' }}>Ask Josie</h2>
          <p>Your AI Sommelier powered by Groq.</p>
        </div>

        {/* CHAT AREA */}
        <div className="chat-interface">
          {!response && !loading && (
            <p className="placeholder-text">
              "Tell me... do you want to smell like a dangerous CEO, a tropical vacation, or a midnight secret?"
            </p>
          )}

          {loading && (
            <div className="loading-state">
              <div className="pulse-circle"></div>
              <p>Josie is smelling the notes...</p>
            </div>
          )}

          {response && (
            <div className="josie-response fade-in">
              <h3 style={{ color: '#C5A059' }}>Josie says:</h3>
              <p>"{response}"</p>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="input-area">
          <input 
            type="text" 
            placeholder="Type your vibe here..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askJosie()}
          />
          <button className="btn-primary" onClick={askJosie}>Ask</button>
        </div>

      </div>
    </div>
  );
};

export default ScentFinder;