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

  const fetchProductDetails = async (id) => {
    const res = await axios.get(`${API_URL}/api/products/${id}`);
    return res.data;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const newChat = [...chat, { role: 'user', content: input }];
    setChat(newChat);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/josie`, { userMessage: input });
      const aiAction = res.data; 

      if (aiAction.type === 'product_card') {
        const product = await fetchProductDetails(aiAction.data.productId);
        aiAction.data.fullProduct = product; 
      }
      setChat([...newChat, { role: 'ai', content: aiAction }]);
    } catch (err) {
      setChat([...newChat, { role: 'ai', content: { type: 'text', data: { message: "Connection faint..." } } }]);
    }
    setLoading(false);
  };

  const renderMessage = (msg, i) => {
    if (msg.role === 'user') return <div key={i} className="msg user">{msg.content}</div>;
    const { type, data } = msg.content;

    if (type === 'text') return <div key={i} className="msg ai">{data.message}</div>;

    if (type === 'product_card' && data.fullProduct) {
      const p = data.fullProduct;
      return (
        <div key={i} className="ai-card fade-in" style={{background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', border: '1px solid #C5A059'}}>
          <p style={{fontStyle: 'italic', color: '#ddd'}}>"{data.reason}"</p>
          <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
            <img src={p.image} alt={p.name} style={{width: '60px', height: '60px', objectFit: 'contain', background: 'white', borderRadius: '4px'}} />
            <div>
              <h4 style={{color: '#C5A059', margin: 0}}>{p.name}</h4>
              <span style={{display: 'block', fontSize: '0.9rem', margin: '5px 0'}}>GH₵{p.price}</span>
              <button onClick={() => addToCart(p)} className="btn-primary" style={{fontSize: '0.8rem', padding: '5px 10px'}}>Add to Cart</button>
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
        <div className="chat-interface" style={{display: 'block', overflowY: 'auto', height: '400px', padding: '20px'}}>
          {chat.length === 0 && <p className="placeholder-text">"I want to smell like a CEO..."</p>}
          <div className="messages-list" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {chat.map((msg, i) => renderMessage(msg, i))}
            {loading && <div>Josie is thinking...</div>}
          </div>
        </div>
        <div className="input-area">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type here..." />
          <button className="btn-primary" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ScentFinder;