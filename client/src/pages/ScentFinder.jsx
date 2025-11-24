import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config';
import './ScentFinder.css';
const ScentFinder = () => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRequestBtn, setShowRequestBtn] = useState(false);
    // 1. Change: Store a history of messages
    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            text: "Welcome to the private salon. Tell me about the occasion, the mood, or a memory you wish to evoke, and I shall find your scent."
        }
    ]);
    // 2. Ref for Auto-scrolling
    const chatEndRef = useRef(null);
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);
    const askJosie = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput(''); // Clear input
        setShowRequestBtn(false);
        // Add User Message to UI
        const newHistory = [...messages, { sender: 'user', text: userMsg }];
        setMessages(newHistory);
        setLoading(true);
        try {
            // 👇 KEY CHANGE: We send 'history' to the backend now
            // We take the last 4 messages so she remembers context without overloading the brain
            const contextHistory = newHistory.slice(-4).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant', // Map 'ai' to 'assistant' for Llama
                content: m.text
            }));
            const res = await axios.post(`${API_URL}/api/josie`, {
                userMessage: userMsg,
                history: contextHistory
            });
            // NEW: Handle the "Generative UI" response
            const aiAction = res.data; // This is now an object { type: "...", data: ... }
            if (aiAction.type === 'text') {
                setMessages(prev => [...prev, { sender: 'ai', text: aiAction.data.message }]);
            }
            else if (aiAction.type === 'recommendation') {
                // Display message + product recommendation
                const productInfo = `${aiAction.data.message}\n\n🌟 **${aiAction.data.product.name}**\n${aiAction.data.product.reason}`;
                setMessages(prev => [...prev, { sender: 'ai', text: productInfo }]);
                // TODO: Render a custom <ProductCard /> here using aiAction.data.product
                // You can store this in a new state variable like `setRecommendedProduct(aiAction.data.product)`
            }
            else if (aiAction.type === 'comparison') {
                // Display message + comparison
                const comparisonText = `${aiAction.data.message}\n\n` +
                    aiAction.data.products.map(p => `• **${p.name}**: ${p.trait}`).join('\n');
                setMessages(prev => [...prev, { sender: 'ai', text: comparisonText }]);
                // TODO: Render a <ComparisonGrid /> using aiAction.data.products
            }
            // Check for "Out of Stock" trigger (keeping this for backwards compatibility)
            if (aiAction.data && aiAction.data.message && aiAction.data.message.includes("currently don't have that in stock")) {
                setShowRequestBtn(true);
            }
        } catch {
            setMessages(prev => [...prev, { sender: 'ai', text: "I seem to have lost my connection to the archives." }]);
        }
        setLoading(false);
    };
    const handleRequestStock = async () => {
        alert("Request sent to our purchasing team.");
        setShowRequestBtn(false);
    };
    return (
        <div className="finder-page container">
            <div className="chat-window glass-card">
                {/* HEADER */}
                <div className="chat-header">
                    <h2>Ask Josie</h2>
                    <span className="status-dot"></span> <small>Online</small>
                </div>
                {/* MESSAGES AREA */}
                <div className="messages-container">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-row ${msg.sender}`}>
                            <div className="message-bubble">
                                {/* Pre-wrap allows new lines to render correctly */}
                                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    {/* Loading Bubble */}
                    {loading && (
                        <div className="message-row ai">
                            <div className="message-bubble typing">
                                <span>.</span><span>.</span><span>.</span>
                            </div>
                        </div>
                    )}
                    {/* Invisible element to scroll to */}
                    <div ref={chatEndRef} />
                </div>
                {/* REQUEST BUTTON (Appears at bottom if needed) */}
                {showRequestBtn && (
                    <div className="request-action fade-in">
                        <p>This item is exclusive.</p>
                        <button className="btn-black-small" onClick={handleRequestStock}>Request Stock</button>
                    </div>
                )}
                {/* INPUT AREA */}
                <div className="input-area">
                    <input
                        type="text"
                        placeholder="Describe your vibe..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && askJosie()}
                    />
                    <button className="send-btn" onClick={askJosie}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ScentFinder;