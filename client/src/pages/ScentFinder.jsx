import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './ScentFinder.css';

const ScentFinder = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useContext(CartContext);

  // Helper: We need to fetch the full product data if the AI only gives us an ID
  const fetchProductDetails = async (id) => {
    const res = await axios.get(`${API_URL}/api/products/${id}`);
    return res.data;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // 1. Add User Message immediately
    const newChat = [...chat, { role: 'user', content: input }];
    setChat(newChat);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/josie`, { userMessage: input });
      const aiAction = res.data; // This is now an object { type: "...", data: ... }

      // 2. Pre-process: If AI recommends a product, we need to fetch its image/price
      if (aiAction.type === 'product_card') {
        const product = await fetchProductDetails(aiAction.data.productId);
        aiAction.data.fullProduct = product; // Attach full data
      }
      
      // 3. Add AI Message to Chat
      setChat([...newChat, { role: 'ai', content: aiAction }]);

    } catch (err) {
      setChat([...newChat, { role: 'ai', content: { type: 'text', data: { message: "My connection is faint..." } } }]);
    }
    setLoading(false);
  };

  // --- THE RENDERER (The "UI Work" Engine) ---
  const renderMessage = (msg, i) => {
    if (msg.role === 'user') return <div key={i} className="msg user">{msg.content}</div>;

    const { type, data } = msg.content;

    if (type === 'text') {
      return <div key={i} className="msg ai">{data.message}</div>;
    }

    if (type === 'product_card' && data.fullProduct) {
      const p = data.fullProduct;
      return (
        <div key={i} className="ai-card fade-in">
          <p className="ai-reason">"{data.reason}"</p>
          <div className="mini-product">
            <img src={p.image} alt={p.name} />
            <div className="mini-info">
              <h4>{p.name}</h4>
              <span>GH₵{p.price}</span>
              <div className="mini-actions">
                <button onClick={() => addToCart(p)} className="btn-gold">Add to Cart</button>
                <Link to={`/product/${p.id}`} className="btn-link">View</Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container finder-page">
      <div className="finder-window glass-card">
        <h2 style={{color: '#C5A059'}}>Ask Josie</h2>
        <div className="chat-interface">
          {chat.length === 0 && <p className="placeholder-text">Describe your vibe (e.g. "Rich CEO on a yacht")</p>}
          
          <div className="messages-list">
            {chat.map((msg, i) => renderMessage(msg, i))}
            {loading && <div className="loading-dots">Josie is thinking...</div>}
          </div>
        </div>

        <div className="input-area">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type here..." 
          />
          <button className="btn-primary" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ScentFinder;