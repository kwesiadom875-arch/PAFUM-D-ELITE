import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [products, setProducts] = useState([]);
  
  // State for the Scraper Input
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', price: '', category: '', description: '', image: '', notes: ''
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/products');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- THE AUTO-FILL LOGIC ---
  const handleScrape = async () => {
    if (!scrapeUrl) return alert("Paste a Fragrantica link first!");
    setIsLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/scrape', { url: scrapeUrl });
      const data = res.data;

      // Populate the form with scraped data
      setForm({
        name: data.name || "",
        price: "", // User must set price manually
        category: "Designer", // Default, user can change
        description: data.description || "",
        image: data.image || "",
        notes: data.notes || ""
      });
      alert("Data Extracted Successfully!");
    } catch (error) {
      alert("Could not scrape this link. Try another.");
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProduct = { ...form, id: Math.floor(Math.random() * 100000) };
      await axios.post('http://127.0.0.1:5000/api/products', newProduct);
      alert("Product Added Successfully!");
      setForm({ name: '', price: '', category: '', description: '', image: '', notes: '' });
      setScrapeUrl('');
      fetchProducts();
    } catch (error) {
      alert("Failed to add product.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this item?")) return;
    await axios.delete(`http://127.0.0.1:5000/api/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="container admin-page">
      <h2 className="section-title" style={{ color: '#C5A059', marginBottom: '20px' }}>Concierge Dashboard</h2>
      
      <div className="admin-grid">
        
        {/* ADD PRODUCT FORM */}
        <div className="glass-card form-section">
          
          {/* --- SCRAPER INPUT --- */}
          <div className="scraper-box" style={{marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '20px'}}>
            <h4 style={{marginBottom: '10px', color: '#C5A059'}}>Auto-Fill from Fragrantica</h4>
            <div style={{display: 'flex', gap: '10px'}}>
              <input 
                placeholder="Paste https://www.fragrantica.com/perfume/..." 
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                style={{marginBottom: 0}}
              />
              <button 
                className="btn-secondary" 
                onClick={handleScrape}
                disabled={isLoading}
              >
                {isLoading ? "..." : "Fetch"}
              </button>
            </div>
          </div>

          <h3 style={{ marginBottom: '15px' }}>Product Details</h3>
          <form onSubmit={handleSubmit}>
            <input name="name" value={form.name} placeholder="Name" onChange={handleChange} required />
            <input name="category" value={form.category} placeholder="Category (e.g. Floral)" onChange={handleChange} required />
            <input name="price" value={form.price} type="number" placeholder="Price (GH₵)" onChange={handleChange} required />
            
            {/* Preview Image if available */}
            {form.image && <img src={form.image} alt="Preview" style={{width: '50px', height: '50px', objectFit: 'contain', marginBottom: '10px'}} />}
            <input name="image" value={form.image} placeholder="Image URL" onChange={handleChange} required />
            
            <input name="notes" value={form.notes} placeholder="Accords (Comma separated)" onChange={handleChange} required />
            <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} rows="5" required />
            
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Save to Inventory</button>
          </form>
        </div>

        {/* PRODUCT LIST */}
        <div className="glass-card list-section">
          <h3 style={{ marginBottom: '15px' }}>Inventory ({products.length})</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {products.map(p => (
              <div key={p.id || p._id} className="admin-item">
                <img src={p.image} alt={p.name} />
                <div style={{ flex: 1 }}>
                  <h4>{p.name}</h4>
                  <p style={{ color: '#C5A059' }}>GH₵{p.price}</p>
                </div>
                <button className="delete-btn" onClick={() => handleDelete(p.id || p._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;