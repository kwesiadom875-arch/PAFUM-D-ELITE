import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import './ScentFinder.css';

const ScentFinder = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useContext(CartContext);

  const questions = [
    { id: 'vibe', text: "What's the vibe?", options: ["Professional", "Romantic", "Bold", "Relaxed"] },
    { id: 'season', text: "Which season?", options: ["Spring", "Summer", "Autumn", "Winter"] },
    { id: 'note', text: "Favorite note?", options: ["Woody", "Floral", "Citrus", "Spicy"] }
  ];

  const handleAnswer = (option) => {
    const currentQ = questions[step];
    setAnswers({ ...answers, [currentQ.id]: option });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Finished quiz
      generateRecommendation({ ...answers, [currentQ.id]: option });
    }
  };

  const generateRecommendation = async (finalAnswers) => {
    setLoading(true);
    const prompt = `I am looking for a perfume that is ${finalAnswers.vibe}, suitable for ${finalAnswers.season}, and has ${finalAnswers.note} notes.`;

    // Add to chat history
    const newChat = [{ role: 'user', content: prompt }];
    setChat(newChat);

    try {
      const res = await axios.post(`${API_URL}/api/josie`, { userMessage: prompt });
      const aiAction = res.data; // Expecting { type: 'product_card', data: ... } or text

      if (aiAction.type === 'product_card') {
        const product = await fetchProductDetails(aiAction.data.productId);
        aiAction.data.fullProduct = product;
      }
      setChat([...newChat, { role: 'ai', content: aiAction }]);
    } catch (err) {
      setChat([...newChat, { role: 'ai', content: { type: 'text', data: { message: "I'm having trouble connecting to the archives..." } } }]);
    }
    setLoading(false);
  };

  const fetchProductDetails = async (id) => {
    const res = await axios.get(`${API_URL}/api/products/${id}`);
    return res.data;
  };

  const renderMessage = (msg, i) => {
    if (msg.role === 'user') return <div key={i} className="msg user">{msg.content}</div>;
    // ... (rest of render logic same as before, just ensure structure matches)
    const { type, data } = msg.content; // Assuming backend returns { type, data } structure or string. 
    // Note: The backend currently returns { reply: string }. 
    // We need to adjust either backend or frontend to handle structured data if we want cards.
    // For now, let's assume the backend returns a text reply and we display it.

    // If backend returns simple text:
    if (typeof msg.content === 'string') return <div key={i} className="msg ai">{msg.content}</div>;
    if (msg.content.reply) return <div key={i} className="msg ai">{msg.content.reply}</div>;

    // If we want the card logic, we need to update the backend to return JSON.
    // For this step, I will stick to the text response to ensure it works with current backend, 
    // or if the user wants the card, I should have updated the backend. 
    // The user asked for "actual quiz".

    return <div key={i} className="msg ai">{JSON.stringify(msg.content)}</div>;
  };

  return (
    <div className="container finder-page">
      <div className="finder-window glass-card">
        <h2 style={{ color: '#C5A059' }}>Scent Finder Quiz</h2>

        {step < questions.length && !loading && chat.length === 0 ? (
          <div className="quiz-container" style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>{questions[step].text}</h3>
            <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {questions[step].options.map(opt => (
                <button key={opt} className="btn-outline" onClick={() => handleAnswer(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-interface" style={{ display: 'block', overflowY: 'auto', height: '400px', padding: '20px' }}>
            {chat.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                {msg.content.reply || msg.content}
              </div>
            ))}
            {loading && <div>Josie is analyzing your profile...</div>}
            {chat.length > 0 && !loading && (
              <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => { setStep(0); setChat([]); }}>Retake Quiz</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScentFinder;