import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config'; // Use your config URL!
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'orders', 'featured'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Featured State
  const [featuredForm, setFeaturedForm] = useState({
    name: '', tagline: '', description: '', image: '', link: '/shop'
  });

  // Updated Form State
  const [form, setForm] = useState({
    name: '', price: '', category: '', description: '', image: '', notes: '',
    perfumer: '', rating: '', gender: '', season: ''
  });

  useEffect(() => {
    if (activeTab === 'inventory') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'featured') fetchFeatured();
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/orders`);
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchFeatured = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/featured`);
      if (res.data && res.data.name) {
        setFeaturedForm(res.data);
      }
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFeaturedChange = (e) => {
    setFeaturedForm({ ...featuredForm, [e.target.name]: e.target.value });
  };

  const handleFeaturedSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/featured`, featuredForm);
      alert("Featured Perfume Updated!");
    } catch (error) { alert("Failed to update."); }
  };

  // AUTO-FILL LOGIC
  const handleScrape = async () => {
    if (!scrapeUrl) return alert("Paste a Fragrantica link first!");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/scrape`, { url: scrapeUrl });
      const data = res.data;

      setForm({
        ...form, // Keep existing price if set
        name: data.name || "",
        category: data.category || "Niche",
        description: data.description || "",
        image: data.image || "",
        notes: data.notes || "",
        perfumer: data.perfumer || "Master Perfumer",
        rating: data.rating || 4.5,
        gender: data.gender || "Unisex",
        season: "All Year" // Fragrantica doesn't have easy text for this, so we default
      });
      alert("Data Extracted Successfully!");
    } catch (error) {
      alert("Could not scrape. Try another link.");
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProduct = { ...form, id: Math.floor(Math.random() * 100000) };
      await axios.post(`${API_URL}/api/products`, newProduct);
      alert("Product Added!");
      // Reset
      setForm({ name: '', price: '', category: '', description: '', image: '', notes: '', perfumer: '', rating: '', gender: '', season: '' });
      setScrapeUrl('');
      fetchProducts();
    } catch (error) { alert("Failed to save."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await axios.delete(`${API_URL}/api/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="container admin-page">
      <div className="admin-header">
        <h2 className="section-title" style={{ color: '#C5A059', marginBottom: '0' }}>Admin Dashboard</h2>
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
            onClick={() => setActiveTab('featured')}
          >
            Featured
          </button>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="admin-grid">
          {/* ADD PRODUCT FORM */}
          <div className="glass-card form-section">
            {/* SCRAPER BOX */}
            <div className="scraper-box" style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#C5A059' }}>Auto-Fill from Fragrantica</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  placeholder="Paste https://www.fragrantica.com/perfume/..."
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  style={{ marginBottom: 0 }}
                />
                <button className="btn-secondary" onClick={handleScrape} disabled={isLoading}>
                  {isLoading ? "Fetching..." : "Auto-Fill"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input name="name" value={form.name} placeholder="Name" onChange={handleChange} required />
                <input name="price" value={form.price} type="number" placeholder="Price (GH₵)" onChange={handleChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input name="category" value={form.category} placeholder="Category (e.g. Woody)" onChange={handleChange} required />
                <input name="gender" value={form.gender} placeholder="Gender (e.g. Unisex)" onChange={handleChange} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input name="perfumer" value={form.perfumer} placeholder="Perfumer Name" onChange={handleChange} />
                <input name="rating" value={form.rating} placeholder="Rating (e.g. 4.5)" onChange={handleChange} />
              </div>

              {form.image && <img src={form.image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'contain', marginBottom: '10px' }} />}
              <input name="image" value={form.image} placeholder="Image URL" onChange={handleChange} required />

              <input name="notes" value={form.notes} placeholder="Accords (Comma separated)" onChange={handleChange} required />
              <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} rows="4" required />

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Save to Inventory</button>
            </form>
          </div>

          {/* PRODUCT LIST */}
          <div className="glass-card list-section">
            <h3 style={{ marginBottom: '15px' }}>Inventory</h3>
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
      )}

      {activeTab === 'orders' && (
        <div className="glass-card orders-section">
          <h3 style={{ marginBottom: '20px' }}>Recent Orders</h3>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i}>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                      <td>
                        <div className="customer-info">
                          <span className="c-name">{order.username}</span>
                          <span className="c-email">{order.email}</span>
                        </div>
                      </td>
                      <td>{order.productName}</td>
                      <td>GH₵{order.finalPrice}</td>
                      <td><span className="status-badge paid">{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'featured' && (
        <div className="glass-card form-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Manage Featured Perfume</h3>
          <p style={{ marginBottom: '20px', color: '#888' }}>This is the perfume that appears at the end of the Home page scroll.</p>

          <form onSubmit={handleFeaturedSubmit}>
            <input name="name" value={featuredForm.name} placeholder="Perfume Name" onChange={handleFeaturedChange} required />
            <input name="tagline" value={featuredForm.tagline} placeholder="Tagline (e.g. A journey through...)" onChange={handleFeaturedChange} required />
            <input name="image" value={featuredForm.image} placeholder="Image URL" onChange={handleFeaturedChange} required />
            {featuredForm.image && <img src={featuredForm.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />}
            <textarea name="description" value={featuredForm.description} placeholder="Short Description" onChange={handleFeaturedChange} rows="3" required />
            <input name="link" value={featuredForm.link} placeholder="Link (e.g. /shop)" onChange={handleFeaturedChange} />

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Update Featured Perfume</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;